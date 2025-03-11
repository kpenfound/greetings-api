package main

import (
	"bufio"
	"fmt"
	"regexp"
	"strings"
)

type CodeSuggestion struct {
	File       string
	Line       int
	Suggestion []string
}

func parseDiff(diffText string) []CodeSuggestion {
	var suggestions []CodeSuggestion
	var currentFile string
	var currentLine int
	var newCode []string
	removalReached := false

	// Regular expressions for file detection and line number parsing
	fileRegex := regexp.MustCompile(`^\+\+\+ b/(.+)`)
	lineRegex := regexp.MustCompile(`^@@ .* \+(\d+),?`)

	scanner := bufio.NewScanner(strings.NewReader(diffText))
	for scanner.Scan() {
		line := scanner.Text()

		// Detect file name
		if matches := fileRegex.FindStringSubmatch(line); matches != nil {
			currentFile = matches[1]
			continue
		}

		// Detect modified line number in the new file
		if matches := lineRegex.FindStringSubmatch(line); matches != nil {
			currentLine = atoi(matches[1]) - 1 // Convert to 0-based index for tracking
			newCode = []string{}               // Reset new code buffer
			removalReached = false
			continue
		}

		// Extract new code (ignoring metadata lines)
		if strings.HasPrefix(line, "+") && !strings.HasPrefix(line, "+++") {
			newCode = append(newCode, line[1:]) // Remove `+`
			continue
		}

		if !removalReached {
			currentLine++ // Track line modifications
		}

		// If a removed line (`-`) appears after `+` lines, store the suggestion
		if strings.HasPrefix(line, "-") && !strings.HasPrefix(line, "---") {
			if len(newCode) > 0 && currentFile != "" {
				suggestions = append(suggestions, CodeSuggestion{
					File:       currentFile,
					Line:       currentLine,
					Suggestion: newCode,
				})
				newCode = []string{} // Reset new code buffer
			}
			removalReached = true
		}

	}

	// If there's a pending multi-line suggestion, add it
	if len(newCode) > 0 && currentFile != "" {
		suggestions = append(suggestions, CodeSuggestion{
			File:       currentFile,
			Line:       currentLine,
			Suggestion: newCode,
		})
	}

	return suggestions
}

// Helper function to convert string to int safely
func atoi(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}
