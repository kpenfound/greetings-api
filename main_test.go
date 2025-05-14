package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"gotest.tools/v3/assert"
)

func TestSelectGreeting(t *testing.T) {
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	if err != nil {
		fmt.Printf("error loading greetings: %s\n", err)
		panic(err)
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

func TestAllEndpoint(t *testing.T) {
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	if err != nil {
		fmt.Printf("error loading greetings: %s\n", err)
		panic(err)
	}

	router := mux.NewRouter()
	router.HandleFunc("/all", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		jsonGreetings, err := json.Marshal(greetings)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = w.Write(jsonGreetings)
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	rec := httptest.NewRecorder()
	req, err := http.NewRequest("GET", "/all", nil)
	if err != nil {
		t.Fatal(err)
	}

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status OK; got %v", rec.Code)
	}

	var actualGreetings []*Greeting
	err = json.Unmarshal(rec.Body.Bytes(), &actualGreetings)
	if err != nil {
		t.Fatal(err)
	}

	assert.DeepEqual(t, greetings, actualGreetings)
}
