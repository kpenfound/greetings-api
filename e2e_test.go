package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"gotest.tools/v3/assert"
)

// End-to-end tests against a running API. They need a server to talk to, which
// `go test` cannot start, so they skip unless GREETINGS_API_URL points at one.
// Under `dagger check go:test-all` it always does: the go module's base
// container is `backend:go-test-base` (wired in dagger.toml), which binds
// `backend:serve` and sets the variable. A skip reports the same as a pass, so
// run with -v to confirm these actually ran.

// apiURL returns the base URL of the API under test, or skips the test.
func apiURL(t *testing.T) string {
	t.Helper()
	url := os.Getenv("GREETINGS_API_URL")
	if url == "" {
		t.Skip("GREETINGS_API_URL not set: no running API to test against (run via `dagger check go:test-all`)")
	}
	return strings.TrimSuffix(url, "/")
}

// get performs a GET against the API and returns the response and its body.
func get(t *testing.T, path string, headers map[string]string) (*http.Response, []byte) {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, apiURL(t)+path, nil)
	assert.NilError(t, err)
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	assert.NilError(t, err)
	body, err := io.ReadAll(resp.Body)
	assert.NilError(t, err)
	assert.NilError(t, resp.Body.Close())
	return resp, body
}

// loadGreetings decodes the embedded greetings.json, the same data the server
// is built from.
func loadGreetings(t *testing.T) []*Greeting {
	t.Helper()
	var greetings []*Greeting
	assert.NilError(t, json.Unmarshal(greetingsJson, &greetings))
	assert.Assert(t, len(greetings) > 0, "greetings.json is empty")
	return greetings
}

// decodeGreeting parses a {"greeting": "..."} response body.
func decodeGreeting(t *testing.T, body []byte) string {
	t.Helper()
	var payload struct {
		Greeting string `json:"greeting"`
	}
	assert.NilError(t, json.Unmarshal(body, &payload), "body: %s", body)
	return payload.Greeting
}

func TestE2ERandomGreeting(t *testing.T) {
	greetings := loadGreetings(t)
	known := map[string]bool{}
	for _, g := range greetings {
		known[g.Greeting] = true
	}

	// Both the root and /random pick a random greeting; the frontend uses /random.
	for _, path := range []string{"/", "/random"} {
		resp, body := get(t, path, nil)
		assert.Equal(t, resp.StatusCode, http.StatusOK, "GET %s: %s", path, body)
		assert.Equal(t, resp.Header.Get("Content-Type"), "application/json")
		greeting := decodeGreeting(t, body)
		assert.Assert(t, known[greeting], "GET %s returned unknown greeting %q", path, greeting)
	}
}

func TestE2EGreetingByLanguage(t *testing.T) {
	for _, g := range loadGreetings(t) {
		resp, body := get(t, "/"+g.Language, nil)
		assert.Equal(t, resp.StatusCode, http.StatusOK, "GET /%s: %s", g.Language, body)
		assert.Equal(t, resp.Header.Get("Content-Type"), "application/json")
		assert.Equal(t, decodeGreeting(t, body), g.Greeting, "GET /%s", g.Language)
	}
}

func TestE2EUnknownLanguage(t *testing.T) {
	// The handler must reply with a clean 400 rather than drop the connection.
	resp, body := get(t, "/foooooo", nil)
	assert.Equal(t, resp.StatusCode, http.StatusBadRequest)
	assert.Assert(t, strings.Contains(string(body), "no greeting found for language 'foooooo'"), "body: %s", body)
}

func TestE2ECORS(t *testing.T) {
	// The frontend is served from a different origin, so the API has to allow it.
	allowed := "http://localhost:8081"
	resp, _ := get(t, "/", map[string]string{"Origin": allowed})
	assert.Equal(t, resp.StatusCode, http.StatusOK)
	assert.Equal(t, resp.Header.Get("Access-Control-Allow-Origin"), allowed)

	resp, _ = get(t, "/", map[string]string{"Origin": "http://example.invalid"})
	assert.Equal(t, resp.StatusCode, http.StatusOK)
	assert.Equal(t, resp.Header.Get("Access-Control-Allow-Origin"), "")
}
