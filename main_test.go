package main

import (
	"bytes"
	"os"
	"testing"
)

func TestMain(t *testing.T) {
	stderr := os.Stderr // Capture the original stderr
	buf := &bytes.Buffer{}
	os.Stderr = buf
	main()
	os.Stderr = stderr // Restore the original stderr
	expectedOutput := "Hello Marvin!\n"
	if buf.String() != expectedOutput {
		t.Errorf("Expected output: %q, got: %q", expectedOutput, buf.String())
	}
}
