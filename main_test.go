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

func TestGreetingItalian(t *testing.T) {
	g := greetingItalian()
	should := "{\"greeting\":\"Saluti, Daggnauti!\"}"

	assert.Equal(t, should, g)
}