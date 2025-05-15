package main

import (
	"context"
	"runtime"

	"backend/internal/dagger"
)

type Backend struct {
	Source *dagger.Directory
}

func New(source *dagger.Directory) *Backend {
	return &Backend{
		Source: source,
	}
}

// Run the unit tests for the backend
func (b *Backend) UnitTest(ctx context.Context) (string, error) {
	return dag.
		Golang().
		WithSource(b.Source).
		Test(ctx)
}

// Lint the backend Go code
func (b *Backend) Lint(ctx context.Context) (string, error) {
	return dag.
		Golang().
		WithSource(b.Source).
		GolangciLint(ctx)
}

// Formatter
func (b *Backend) Format() *dagger.Directory {
	return dag.
		Golang().
		WithSource(b.Source).
		Fmt().
		GolangciLintFix()
}

// Checker
func (b *Backend) Check(ctx context.Context) (string, error) {
	lint, err := b.Lint(ctx)
	if err != nil {
		return "", err
	}
	test, err := b.UnitTest(ctx)
	if err != nil {
		return "", err
	}
	return lint + "\n" + test, nil
}

// Build the backend
func (b *Backend) Build(
	// +optional
	arch string,
) *dagger.Directory {
	if arch == "" {
		arch = runtime.GOARCH
	}
	return dag.
		Golang().
		WithSource(b.Source).
		Build([]string{}, dagger.GolangBuildOpts{Arch: arch})
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
func (b *Backend) Serve() *dagger.Service {
	return b.Container(runtime.GOARCH).AsService(dagger.ContainerAsServiceOpts{UseEntrypoint: true})
}

// Stateless checker
func (b *Backend) CheckDirectory(
	ctx context.Context,
	// Directory to run checks on
	source *dagger.Directory) (string, error) {
	b.Source = source
	return b.Check(ctx)
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
