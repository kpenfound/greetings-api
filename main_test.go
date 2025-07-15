package main

import (
	"encoding/json"
	"fmt"
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

func TestSelectFarewell(t *testing.T) {
	var farewells []*Farewell
	err := json.Unmarshal(farewellsJson, &farewells)
	if err != nil {
		fmt.Printf("error loading farewells: %s\n", err)
		os.Exit(1)
	}

	english := &Farewell{
		Farewell: "Goodbye, World!",
		Language: "english",
	}

	// Test with a language
	f, err := SelectFarewell(farewells, "english")
	assert.NilError(t, err)
	assert.Equal(t, *english, *f)

	// Test random
	_, err = SelectFarewell(farewells, "random")
	assert.NilError(t, err)

	// Test invalid language
	_, err = SelectFarewell(farewells, "foooooo")
	assert.Error(t, err, "no farewell found for language 'foooooo'")

	// Test empty language
	_, err = SelectFarewell(farewells, "")
	assert.Error(t, err, "no farewell found for language ''")
}

func TestFormatResponse(t *testing.T) {
	g := &Greeting{
		Greeting: "Hello, World!",
		Language: "english",
	}

	formatted := FormatResponse(g)
	assert.Equal(t, "{\"greeting\":\"Hello, World!\"}", formatted)
}

func TestFormatFarewellResponse(t *testing.T) {
	f := &Farewell{
		Farewell: "Goodbye, World!",
		Language: "english",
	}

	formatted := FormatFarewellResponse(f)
	assert.Equal(t, "{\"farewell\":\"Goodbye, World!\"}", formatted)
}
