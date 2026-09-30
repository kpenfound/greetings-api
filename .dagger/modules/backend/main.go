package main

import (
	"backend/internal/dagger"
)

type Backend struct {
	// The compiled backend binary
	Binary *dagger.File
}

func New(
	// The compiled backend binary. dagger.toml wires this to the go module's
	// build of the root package.
	binary *dagger.File,
) *Backend {
	return &Backend{
		Binary: binary,
	}
}

// Get a container ready to run the backend
func (b *Backend) Container() *dagger.Container {
	return dag.
		Container().
		From("cgr.dev/chainguard/wolfi-base:latest@sha256:a8c9c2888304e62c133af76f520c9c9e6b3ce6f1a45e3eaa57f6639eb8053c90").
		WithFile("/bin/greetings-api", b.Binary).
		WithEntrypoint([]string{"/bin/greetings-api"}).
		WithExposedPort(8080)
}

// Get a Service to run the backend
//
// +up
func (b *Backend) Serve() *dagger.Service {
	return b.Container().AsService(dagger.ContainerAsServiceOpts{UseEntrypoint: true})
}

// A Go container with the backend API running as a bound service, for the go
// module's `base` setting (dagger.toml: [modules.go.settings] base =
// "backend:go-test-base").
//
// The e2e tests in e2e_test.go need a server to talk to, which the go
// toolchain has no way to start. Handing it a base container with the service
// already bound lets its own test check run them; without this they skip, and
// a skip reports the same as a pass.
//
// Deliberately no workdir, source mount or cache mounts: the go module adds its
// own on top. This is only an image plus a service and the address to reach it.
// The binding survives into every command the toolchain derives from this.
//
// The image matches the toolchain's own default rather than the version in
// go.mod. It has to: this base also builds the toolchain's helper binaries,
// whose go.mod requires 1.26, so an older image fails before any test runs.
func (b *Backend) GoTestBase() *dagger.Container {
	return dag.Container().
		From("golang:1.26-alpine").
		WithServiceBinding("api", b.Serve()).
		WithEnvVariable("GREETINGS_API_URL", "http://api:8080")
}
