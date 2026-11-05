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
```

Checks and services come from the project's modules (`backend`, `frontend`) and
reusable modules installed in the workspace ([go](https://github.com/dagger/go),
[golangci-lint](https://github.com/dagger/go/tree/do-not-merge-hack/golangci-lint),
[eslint](https://github.com/dagger/eslint),
[playwright](https://github.com/dagger/playwright)). The reusable modules are
wired to the project's services in `dagger.toml`: `go:test-all` runs the Go e2e
tests against `backend:serve`, and `playwright:test` runs the browser tests
against `frontend:serve`. List them with `dagger check -l` and `dagger up -l`.

## Demos

- [Module Wiring](./MODULE_WIRING.md)
