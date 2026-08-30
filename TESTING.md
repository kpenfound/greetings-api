# Test Documentation

> **Note**: For general contribution guidelines including testing requirements, see [CONTRIBUTING.md](./CONTRIBUTING.md)

This document describes the comprehensive testing approach for the Greetings API project.

## Overview

The Greetings API project includes multiple layers of testing to ensure reliability and correctness:
- Unit tests for backend logic
- End-to-end tests for the frontend
- Linting for code quality

## Backend Tests

The backend tests are located in `main_test.go` and use the `gotest.tools/v3` testing framework.

### Test Functions

#### TestSelectGreeting
Tests the core greeting selection logic with multiple scenarios:
- **Valid language selection**: Tests retrieval of greetings by specific language (e.g., "english")
- **Random selection**: Tests the random greeting functionality
- **Invalid language handling**: Verifies proper error handling for non-existent languages
- **Empty language handling**: Ensures errors are returned for empty language strings

#### TestFormatResponse
Tests the JSON response formatting:
- Verifies the greeting is properly formatted as JSON
- Ensures the structure matches the expected API response format: `{"greeting":"<message>"}`

### Test Coverage

Current test coverage includes:
- ✅ Greeting selection by language
- ✅ Random greeting selection  
- ✅ Error handling for invalid languages
- ✅ Error handling for empty language strings
- ✅ Response formatting

## Frontend Tests

End-to-end tests for the frontend are located in `website/cypress/e2e/greeting_test.cy.ts` using Cypress.

### Test Scenarios

1. **Page Load Test**: Verifies the page loads correctly with the expected header
2. **Greeting Button Test**: Verifies clicking the greeting button changes the displayed message

## Running Tests

### All Tests (Recommended)
```bash
dagger call check
```

This runs:
- Backend linting (golangci-lint)
- Backend unit tests
- Frontend E2E tests
- Frontend linting

### Backend Tests Only
```bash
# Using Dagger
dagger call test

# Or directly with Go
go test ./...
```

### Frontend Tests Only
```bash
cd website
npm run test:e2e
```

### Linting Only
```bash
# Backend
dagger call lint

# Frontend (part of check command)
dagger call check
```

## Test Data

Greetings test data is embedded from `greetings.json` which includes:
- 17 different language greetings
- Languages: English, British, French, Italian, Spanish, German, Mandarin, Hindi, Arabic, Bengali, Russian, Portuguese, Urdu, Indonesian, Japanese, Marathi, Telugu

## Continuous Integration

Tests are automatically run in CI through Dagger modules. The CI ensures:
- All tests pass before merging
- Code meets linting standards
- No regressions are introduced

## Future Test Improvements

Potential areas for additional testing coverage:
- HTTP handler integration tests (testing the actual HTTP endpoints with httptest)
- Additional edge cases for error handling
- Performance/load testing for the API
- Testing CORS functionality
- Testing with empty greetings.json
- Concurrency testing for random selection

## Test Best Practices

When adding new tests:
1. Follow Go testing conventions
2. Use descriptive test function names
3. Test both happy paths and error cases
4. Keep tests isolated and independent
5. Run `dagger call check` before committing
6. Update TESTING.md when adding new test files or significantly changing test structure
