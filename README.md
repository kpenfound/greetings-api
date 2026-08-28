# greetings-api

A simple greeting api with a beatuiful frontend.

## Try it out!

```
dagger up
```

or without even cloning this repo:
```
dagger -W github.com/kpenfound/greetings-api up
```

The frontend will be available at http://localhost:8081/ and the backend at http://localhost:8080/

## Daggerized!

Run the CI checks:

```
dagger check
```

Dagger functions:

```
Name                    Description
build                   Build the backend and frontend for a specified environment
debug-broken-tests-pr   Debug broken tests on a pull request and comment fix suggestions
debug-tests             Debug broken tests. Returns a unified diff of the test fixes
develop                 Complete an assignment for the greetings project and get back the completed work
develop-feedback        Agent to develop changes based on feedback on changes made in a Directory
develop-pull-request    Develop changes based on a Github issue and open a pull request
develop-review          Agent to review changes made in a Directory
pull-request-feedback   Receive feedback on an open pull request via slash command
pull-request-review     Review an open pull request via slash command
release                 Create a GitHub release
```

Checks and services come from the project's modules (`backend`, `frontend`) and
reusable modules installed in the workspace ([go](https://github.com/dagger/go),
[eslint](https://github.com/dagger/eslint),
[playwright](https://github.com/dagger/playwright)). The reusable modules are
wired to the project's services in `dagger.toml`: `go:test-all` runs the Go e2e
tests against `backend:serve`, and `playwright:test` runs the browser tests
against `frontend:serve`. List them with `dagger check -l` and `dagger up -l`.

## Demos

- [Debugger Agent](./DEBUGGER_AGENT.md)
- [SWE Agent](./SWE_AGENT.md)
- [Agentic CI](./AGENTIC_CI.md)
- [Module Wiring](./MODULE_WIRING.md)
