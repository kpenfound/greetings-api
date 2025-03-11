# greetings-api

A simple greeting api

## Try it out!

```
> go run main.go
...
listening on :8080
```

```
> curl -s http://localhost:8080 | jq
{
  "greeting": "Hello"
}
```

## New Frontend!

Website located in the website/ directory


## Daggerized!

Dagger functions:

```
Name                    Description
build                   Build the backend and frontend for a specified environment
check                   Run the CI Checks for the project
debug-broken-tests-pr   Debug broken tests on a pull request and comment fix suggestions
debug-tests             Debug broken tests. Returns a unified diff of the test fixes
lint                    Lint the Go code in the project
release                 Create a GitHub release
serve                   Serve the backend and frontend to 8080 and 8081 respectively
test                    Run unit tests for the project
```
