package main

import (
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

func TestSelectGreetingEmptySlice(t *testing.T) {
	// Test with empty greetings slice
	emptyGreetings := []*Greeting{}
	_, err := SelectGreeting(emptyGreetings, "english")
	assert.Error(t, err, "no greetings available")

	_, err = SelectGreeting(emptyGreetings, "random")
	assert.Error(t, err, "no greetings available")
}

func TestSelectGreetingAllLanguages(t *testing.T) {
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	// Test all languages in greetings.json
	expectedLanguages := map[string]string{
		"english":    "Hello, World!",
		"british":    "Hello, World! Cheers!",
		"french":     "Bonjour, Monde !",
		"italian":    "Ciao, Mondo!",
		"spanish":    "¡Hola, Mundo!",
		"german":     "Hallo, Welt!",
		"mandarin":   "你好，世界！",
		"hindi":      "नमस्ते दुनिया!",
		"arabic":     "مرحبا بالعالم!",
		"bengali":    "ওহে বিশ্ব!",
		"russian":    "Привет, мир!",
		"portuguese": "Olá, Mundo!",
		"urdu":       "ہیلو، دنیا!",
		"indonesian": "Halo Dunia!",
		"japanese":   "こんにちは世界！",
		"marathi":    "नमस्कार जग!",
		"telugu":     "హలో ప్రపంచం!",
	}

	for language, expectedGreeting := range expectedLanguages {
		g, err := SelectGreeting(greetings, language)
		assert.NilError(t, err, "Failed to select greeting for language: %s", language)
		assert.Equal(t, g.Language, language)
		assert.Equal(t, g.Greeting, expectedGreeting)
	}
}

func TestFormatResponse(t *testing.T) {
	g := &Greeting{
		Greeting: "Hello, World!",
		Language: "english",
	}

	formatted := FormatResponse(g)
	assert.Equal(t, "{\"greeting\":\"Hello, World!\"}", formatted)
}

func TestFormatResponseSpecialCharacters(t *testing.T) {
	// Test with special characters
	g := &Greeting{
		Greeting: "Hello, \"World\"!",
		Language: "test",
	}

	formatted := FormatResponse(g)
	assert.Equal(t, "{\"greeting\":\"Hello, \"World\"!\"}", formatted)
}

func TestRootHandlerIntegration(t *testing.T) {
	// Test the actual root handler using mux
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	router := mux.NewRouter()
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, "random")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	req, err := http.NewRequest("GET", "/", nil)
	assert.NilError(t, err)

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, rr.Code, http.StatusOK)
	assert.Equal(t, rr.Header().Get("Content-Type"), "application/json")
	
	// Verify the response is valid JSON with greeting field
	var response map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NilError(t, err)
	_, exists := response["greeting"]
	assert.Assert(t, exists, "Response should contain greeting field")
}

func TestLanguageHandlerIntegration(t *testing.T) {
	// Test the actual language handler using mux
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	router := mux.NewRouter()
	router.HandleFunc("/{language}", func(w http.ResponseWriter, r *http.Request) {
		language := mux.Vars(r)["language"]
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, language)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	// Test with English
	req, err := http.NewRequest("GET", "/english", nil)
	assert.NilError(t, err)

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, rr.Code, http.StatusOK)
	assert.Equal(t, rr.Header().Get("Content-Type"), "application/json")
	assert.Equal(t, rr.Body.String(), "{\"greeting\":\"Hello, World!\"}")
}

func TestLanguageHandlerError(t *testing.T) {
	// Test error handling in language handler
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	router := mux.NewRouter()
	router.HandleFunc("/{language}", func(w http.ResponseWriter, r *http.Request) {
		language := mux.Vars(r)["language"]
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, language)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	// Test with invalid language
	req, err := http.NewRequest("GET", "/invalidlanguage", nil)
	assert.NilError(t, err)

	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, rr.Code, http.StatusBadRequest)
	assert.Assert(t, strings.Contains(rr.Body.String(), "no greeting found for language 'invalidlanguage'"))
}

func TestMultipleLanguageRequests(t *testing.T) {
	// Test multiple language requests
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	router := mux.NewRouter()
	router.HandleFunc("/{language}", func(w http.ResponseWriter, r *http.Request) {
		language := mux.Vars(r)["language"]
		w.Header().Set("Content-Type", "application/json")
		greeting, err := SelectGreeting(greetings, language)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = w.Write([]byte(FormatResponse(greeting)))
		if err != nil {
			panic(err)
		}
	}).Methods("GET")

	testCases := []struct {
		language string
		expected string
	}{
		{"french", "Bonjour, Monde !"},
		{"spanish", "¡Hola, Mundo!"},
		{"german", "Hallo, Welt!"},
		{"italian", "Ciao, Mondo!"},
	}

	for _, tc := range testCases {
		req, err := http.NewRequest("GET", "/"+tc.language, nil)
		assert.NilError(t, err)

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		assert.Equal(t, rr.Code, http.StatusOK)
		expectedResponse := fmt.Sprintf("{\"greeting\":\"%s\"}", tc.expected)
		assert.Equal(t, rr.Body.String(), expectedResponse)
	}
}

func TestRandomGreetingConsistency(t *testing.T) {
	// Test that random greeting returns valid greetings
	var greetings []*Greeting
	err := json.Unmarshal(greetingsJson, &greetings)
	assert.NilError(t, err)

	// Test multiple random selections
	for i := 0; i < 10; i++ {
		g, err := SelectGreeting(greetings, "random")
		assert.NilError(t, err)
		assert.Assert(t, g != nil)
		assert.Assert(t, g.Language != "")
		assert.Assert(t, g.Greeting != "")
		
		// Verify the greeting is one of the valid greetings
		found := false
		for _, validGreeting := range greetings {
			if validGreeting.Language == g.Language && validGreeting.Greeting == g.Greeting {
				found = true
				break
			}
		}
		assert.Assert(t, found, "Random greeting should be from the valid greetings list")
	}
}
