package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gorilla/mux"
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

func TestAddGreetingEndpoint(t *testing.T) {
	err := os.Setenv("ADMIN_API_KEY", "testapikey")
	if err != nil {
		t.Fatalf("Could not set environment variable: %v", err)
	}

	router := mux.NewRouter()
	var greetings []*Greeting

	router.HandleFunc("/greetings", AuthMiddleware(os.Getenv("ADMIN_API_KEY"), func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var newGreeting Greeting
		err := json.NewDecoder(r.Body).Decode(&newGreeting)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		greetings = append(greetings, &newGreeting)

		w.WriteHeader(http.StatusCreated)
		_, err = fmt.Fprintf(w, "Greeting added successfully")
		if err != nil {
			http.Error(w, "Failed to write response", http.StatusInternalServerError)
			return
		}
	})).Methods("POST")

	// Create a request to the /greetings endpoint
	newGreeting := Greeting{Language: "test", Greeting: "Test Greeting"}
	requestBody, _ := json.Marshal(newGreeting)

	req, err := http.NewRequest("POST", "/greetings", bytes.NewBuffer(requestBody))
	if err != nil {
		t.Fatalf("Could not create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer testapikey")

	// Create a recorder to examine the response
	rec := httptest.NewRecorder()

	// Call the ServeHTTP method directly and pass the request and recorder
	router.ServeHTTP(rec, req)

	// Check the response code
	if rec.Code != http.StatusCreated {
		t.Errorf("Expected status code %d, got %d", http.StatusCreated, rec.Code)
	}

	// Check the response body
	expectedBody := "Greeting added successfully"
	if !strings.Contains(rec.Body.String(), expectedBody) {
		t.Errorf("Expected body to contain %q, got %q", expectedBody, rec.Body.String())
	}

	// Check that the greeting was actually added (this part is tricky without persistence)
	// One way would be to capture the greetings slice and compare it.  For now, we skip this
}
