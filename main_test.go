package main

import (
	"testing"

	"gotest.tools/v3/assert"
)

func TestGreeting(t *testing.T) {
	g := greeting()
	should := "{\"greeting\":\"Greetings Daggernauts!\"}"

	assert.Equal(t, should, g)
}

func TestFrenchGreeting(t *testing.T) {
	fg := frenchGreeting()
	should := "{\"greeting\":\"Salutations Daggernauts !\"}"

	assert.Equal(t, should, fg)
}