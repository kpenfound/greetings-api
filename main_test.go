// main_test.go
package main

import (
	"testing"
)

func TestGreeting(t *testing.T) {
	got := greeting()
	want := "Hello Marvin!"
	if got != want {
		t.Errorf("greeting() = %q, want %q", got, want)
	}
}