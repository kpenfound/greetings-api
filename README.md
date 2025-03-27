# greetings-api

A simple greeting api with a beatuiful frontend.

## Try it out!

```
dagger call serve up
```

The frontend will be available at http://localhost:8081/


## Daggerized!

Dagger functions:

```
Name                    Description
build                   Build the backend and frontend for a specified environment
check                   Run the CI Checks for the project
debug-broken-tests-pr   Debug broken tests on a pull request and comment fix suggestions
debug-tests             Debug broken tests. Returns a unified diff of the test fixes
develop                 Complete an assignment for the greetings project and get back the completed work
develop-pull-request    -
lint                    Lint the Go code in the project
release                 Create a GitHub release
serve                   Serve the backend and frontend to 8080 and 8081 respectively
test                    Run unit tests for the project
```

## Demos

- [Debugger Agent](./DEBUGGER_AGENT.md)
- [SWE Agent](./SWE_AGENT.md)
