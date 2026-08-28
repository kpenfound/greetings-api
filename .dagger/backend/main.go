package main

import (
	"context"
	"runtime"
	"strings"

	"backend/internal/dagger"
)

type Backend struct {
	Source *dagger.Directory
}

func New(
	// +optional
	// +defaultPath="/"
	// +ignore=[".git", "**/node_modules", "website"]
	source *dagger.Directory,
) *Backend {
	return &Backend{
		Source: source,
	}
}

// golangciLintImage matches the pinned lint image used by the dagger/go module
const golangciLintImage = "docker.io/golangci/golangci-lint:v2.11.4-alpine@sha256:72bcd68512b4e27540dd3a778a1b7afd45759d8145cfb3c089f1d7af53e718e9"

// source mounted into the Go toolchain container, ready to run go commands
func (b *Backend) goBase() *dagger.Container {
	return dag.Go().Base().
		WithDirectory("/ws", b.Source).
		WithWorkdir("/ws")
}

// source mounted into the golangci-lint container
func (b *Backend) lintBase() *dagger.Container {
	return dag.Container().
		From(golangciLintImage).
		WithMountedCache("/go/pkg/mod", dag.CacheVolume("go-mod")).
		WithEnvVariable("GOMODCACHE", "/go/pkg/mod").
		WithMountedCache("/root/.cache/go-build", dag.CacheVolume("go-build")).
		WithEnvVariable("GOCACHE", "/root/.cache/go-build").
		WithMountedCache("/root/.cache/golangci-lint", dag.CacheVolume("golangci-lint")).
		WithDirectory("/ws", b.Source).
		WithWorkdir("/ws")
}

// Formatter
func (b *Backend) Format() *dagger.Directory {
	return b.lintBase().
		WithExec([]string{"gofmt", "-w", "."}).
		WithExec([]string{"golangci-lint", "run", "--fix"}).
		Directory("/ws")
}

// Build the backend
func (b *Backend) Build(
	// +optional
	arch string,
) *dagger.Directory {
	if arch == "" {
		arch = runtime.GOARCH
	}
	built := b.goBase().
		WithEnvVariable("GOOS", "linux").
		WithEnvVariable("GOARCH", arch).
		WithExec([]string{"go", "build", "-o", "greetings-api", "."})
	return dag.Directory().WithFile("greetings-api", built.File("greetings-api"))
}

// Return the compiled backend binary for a particular architecture
func (b *Backend) Binary(
	// +optional
	arch string,
) *dagger.File {
	d := b.Build(arch)
	return d.File("greetings-api")
}

// Get a container ready to run the backend
func (b *Backend) Container(
	// +optional
	arch string,
) *dagger.Container {
	if arch == "" {
		arch = runtime.GOARCH
	}
	bin := b.Binary(arch)
	return dag.
		Container(dagger.ContainerOpts{Platform: dagger.Platform(arch)}).
		From("cgr.dev/chainguard/wolfi-base:latest@sha256:a8c9c2888304e62c133af76f520c9c9e6b3ce6f1a45e3eaa57f6639eb8053c90").
		WithFile("/bin/greetings-api", bin).
		WithEntrypoint([]string{"/bin/greetings-api"}).
		WithExposedPort(8080)
}

// Get a Service to run the backend
//
// +up
func (b *Backend) Serve() *dagger.Service {
	return b.Container(runtime.GOARCH).AsService(dagger.ContainerAsServiceOpts{UseEntrypoint: true})
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

// Stateless checker
func (b *Backend) CheckDirectory(
	ctx context.Context,
	// Directory to run checks on
	source *dagger.Directory) (string, error) {
	b.Source = source
	lint, err := b.lintBase().
		WithExec([]string{"golangci-lint", "run"}).
		Stdout(ctx)
	if err != nil {
		return "", err
	}
	test, err := b.goBase().
		WithExec([]string{"go", "test", "./..."}).
		Stdout(ctx)
	if err != nil {
		return "", err
	}
	return lint + "\n" + test, nil
}

// Stateless formatter
func (b *Backend) FormatDirectory(
	// Directory to format
	source *dagger.Directory,
) *dagger.Directory {
	b.Source = source
	return b.Format()
}

// Stateless formatter
func (b *Backend) FormatFile(
	// Directory with go module
	source *dagger.Directory,
	// File path to format
	path string,
) *dagger.Directory {
	// Only format go files
	if !strings.HasSuffix(path, ".go") {
		return source
	}
	return dag.
		Container().
		From("golang:1.24").
		WithExec([]string{"go", "install", "golang.org/x/tools/gopls@latest"}).
		WithWorkdir("/app").
		WithDirectory("/app", source).
		WithExec([]string{"gopls", "format", "-w", path}).
		WithExec([]string{"gopls", "imports", "-w", path}).
		Directory("/app")
}
