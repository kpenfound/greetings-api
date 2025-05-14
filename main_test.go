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

func TestGreetingsEndpoint(t *testing.T) {
	// Create a request to pass to our handler.
	req, err := http.NewRequest("GET", "/greetings", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We create a ResponseRecorder (which satisfies http.ResponseWriter)
	// to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var greetings []*Greeting
		err := json.Unmarshal(greetingsJson, &greetings)
		if err != nil {
			t.Errorf("error loading greetings: %v", err)
			return
		}
		jsonGreetings, err := json.Marshal(greetings)
		if err != nil {
			t.Errorf("Error marshalling greetings: %v", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(jsonGreetings)
		if err != nil {
			t.Errorf("Error writing response: %v", err)
			return
		}
	})

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body is what we expect.

	var expectedGreetings []*Greeting
	err = json.Unmarshal(greetingsJson, &expectedGreetings)
	if err != nil {
		t.Fatalf("Error unmarshalling expected greetings: %v", err)
	}

	marshaledExpectedGreetings, err := json.Marshal(expectedGreetings)
	if err != nil {
		t.Fatalf("Error marshalling expected greetings: %v", err)
	}

	assert.Equal(t, string(marshaledExpectedGreetings), rr.Body.String())
}
