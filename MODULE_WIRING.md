# Module Wiring 🔌

Reusable Dagger modules running this project's e2e tests against its real services, with no custom check functions.

## Overview

The Go tests and the Playwright tests in this project both need a running service: the Go e2e tests talk to the backend API over HTTP, and the Playwright tests drive a browser against the served frontend.

The modules that run those tests, [go](https://github.com/dagger/go) and [playwright](https://github.com/dagger/playwright), are reusable modules from GitHub. They know how to run `go test` and `playwright test`, but they know nothing about this project and cannot start its services.

Module wiring closes that gap. A module setting in `dagger.toml` can point at a function of one of the project's own modules using the form `"<module>:<function>"`. Dagger calls that function when it loads the workspace and passes the result in as the setting's value. The reusable module gets a project-specific container or service and carries on as if it had been given one on the command line.

The result is that `dagger check` runs real e2e tests, and the project's Dagger code is a couple of small functions that describe its services rather than a set of hand-written checks.

## Implementation

Both wires live in [dagger.toml](./dagger.toml).

### go ← backend:go-test-base

The go module's `base` setting is the container it derives every `go test` run from. This project wires it to a function on the [backend](./.dagger/backend/main.go) module:

```toml
[modules.go.settings]
base = "backend:go-test-base"
```

The `go-test-base` function returns a Go container with the API already bound as a service:

```go
func (b *Backend) GoTestBase() *dagger.Container {
	return dag.Container().
		From("golang:1.26-alpine").
		WithServiceBinding("api", b.Serve()).
		WithEnvVariable("GREETINGS_API_URL", "http://api:8080")
}
```

A few things are deliberate here:
- It is only an image, a service binding and the address to reach it. There is no workdir, source mount or cache mount, because the go module adds its own on top of the base.
- The service binding survives into every container the go module derives from it, so when `go test` runs, the backend is up and reachable at `http://api:8080`.
- The image matches the go module's own default. The base also builds the module's helper binaries, whose `go.mod` requires Go 1.26, so an older image would fail before any test ran.

The e2e tests in [e2e_test.go](./e2e_test.go) read `GREETINGS_API_URL` and skip when it is unset, so a plain `go test ./...` on a laptop still works and only runs the unit tests. Under `dagger check go:test-all` the variable is always set, and the tests exercise the real server: the random and per-language endpoints, the 400 for an unknown language, and the CORS headers the frontend depends on.

That last point is why the wiring matters. A skipped test reports the same as a passing one. Without the base wired in, `go:test-all` would be green while checking nothing the unit tests did not already cover. Writing the e2e tests in the first place turned up a bug the unit tests could not see: the API dropped the connection on an unknown language instead of returning a 400.

### playwright ← frontend:serve

The playwright module's `service` setting is the service it runs the browser tests against. This project wires it to the [frontend](./.dagger/frontend/src/index.ts) module's `serve` function, the same one `dagger up` uses:

```toml
[modules.playwright.settings]
service = "frontend:serve"
```

The playwright module binds that service into its test container as `frontend` and sets `PLAYWRIGHT_BASE_URL` to its exposed port. [website/playwright.config.ts](./website/playwright.config.ts) reads the variable, so the same specs run against `http://frontend:8081` in Dagger and `http://localhost:8081` on a laptop.

### What this replaces

Before wiring, each of these needed a custom check function in the project's Dagger module: build a test container, start the service, bind it, run the tests, and keep that in step with whatever the upstream module did. Now the project's modules expose a `Container` and a `Service`, the reusable modules own the test logic, and `dagger.toml` connects the two.

## How do I try it?

The only dependency is Dagger. This project targets the v1 beta, so run the CLI with `DAGGER_X_RELEASE=v1.0.0-beta.11` (the commands below assume it is exported).

Fork or clone this repository:
```
git clone https://github.com/kpenfound/greetings-api
cd greetings-api
```

⋈ List the checks. The go and playwright checks come from the reusable modules, not from this project's code:
```
dagger check -l
```

⋈ Run the Go tests. The trace shows `greetings-api` starting as a service alongside the tests, and all six tests (two unit, four e2e) pass:
```
dagger check go:test-all -v
```

⋈ Run the browser tests. The trace shows the nginx frontend service starting:
```
dagger check playwright:test -v
```

⋈ See what the go module is being handed. This is the same container the wiring passes in, as `dagger.toml` sees it:
```
dagger api call backend go-test-base
```

⋈ Prove the wiring is doing the work. Comment out the `base = "backend:go-test-base"` line in `dagger.toml` and run the check again with enough verbosity to see individual tests:
```
dagger check go:test-all -vvv
```
The check still passes, but the summary now reads `4 skipped, 2 passed` and each e2e test reports `GREETINGS_API_URL not set`. Restore the line and it is back to `6 passed`.
