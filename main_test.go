package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"gotest.tools/v3/assert"
)

func TestSelectGreeting(t *testing.T) {
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	if err != nil {
		fmt.Printf("error loading greetings: %s\n", err)
		os.Exit(1)
	}

	english := &Greeting{
		Greeting: "Hello, World!",
		Language: "english",
	}

	// Test with a language
	g, err := SelectGreeting(greetings, "english")
	assert.NilError(t, err)
	assert.Equal(t, *english, *g)

	// Test random
	_, err = SelectGreeting(greetings, "random")
	assert.NilError(t, err)

	// Test invalid language
	_, err = SelectGreeting(greetings, "foooooo")
	assert.Error(t, err, "no greeting found for language 'foooooo'")

	// Test empty language
	_, err = SelectGreeting(greetings, "")
	assert.Error(t, err, "no greeting found for language ''")
}

func TestFormatResponse(t *testing.T) {
	g := &Greeting{
		Greeting: "Hello, World!",
		Language: "english",
	}

	formatted := FormatResponse(g)
	assert.Equal(t, "{\"greeting\":\"Hello, World!\"}", formatted)
}

func TestRootHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/", nil)
	assert.NilError(t, err)

	rr := httptest.NewRecorder()

	var greetings []*Greeting
	err = json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		greeting, err := SelectGreeting(greetings, "random")
		assert.NilError(t, err)
		_, err = w.Write([]byte(FormatResponse(greeting)))
		assert.NilError(t, err)
	})

	handler.ServeHTTP(rr, req)

	assert.Equal(t, rr.Code, http.StatusOK)
}

func TestLanguageHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/english", nil)
	assert.NilError(t, err)

	rr := httptest.NewRecorder()

	var greetings []*Greeting
	err = json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		language := "english"
		greeting, err := SelectGreeting(greetings, language)
		assert.NilError(t, err)
		_, err = w.Write([]byte(FormatResponse(greeting)))
		assert.NilError(t, err)
	})

	handler.ServeHTTP(rr, req)

	assert.Equal(t, rr.Code, http.StatusOK)
	assert.Equal(t, rr.Body.String(), "{\"greeting\":\"Hello, World!\"}")
}
