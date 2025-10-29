// A golang toolchain module

package main

import (
	"context"
	"dagger/go/internal/dagger"

	"github.com/containerd/platforms"
)

type Go struct {
	// +private
	Source *dagger.Directory
}

func New(
	// +defaultPath="/"
	source *dagger.Directory,
) *Go {
	return &Go{
		Source: source,
	}
}

// Test the project
func (b *Go) Test(
	ctx context.Context,
	// +default="./..."
	pkg string,
	// +optional
	platform dagger.Platform,
) (dagger.CheckStatus, error) {
	_, err := b.base(platform).
		WithExec([]string{"go", "test", pkg}).Sync(ctx)
	return dagger.CheckStatusCompleted, err
}

// Lint Go code
func (b *Go) GolangCiLint(
	ctx context.Context,
	// Extra arguments to pass to golangci-lint
	// +default=[]
	args []string,
	// Golangci-lint image to use
	// +default="golangci/golangci-lint:v2.1"
	golangciLintImage string,
) (dagger.CheckStatus, error) {
	_, err := dag.
		Container().
		From(golangciLintImage).
		WithWorkdir("/app").
		WithDirectory("/app", b.Source).
		WithExec(append([]string{"golangci-lint", "run", "-v", "--timeout", "5m"}, args...)).
		Sync(ctx)
	return dagger.CheckStatusCompleted, err
}

// Build the project
func (b *Go) Build(
	// +default="./..."
	pkg string,
	// +optional
	platform dagger.Platform,
) *dagger.Directory {
	return b.base(platform).
		WithExec([]string{"go", "build", "-o", "out/", pkg}).
		Directory("out")
}

func (b *Go) base(platform dagger.Platform) *dagger.Container {
	p := platforms.MustParse(string(platform))
	return dag.
		Container().
		From("golang:1.24").
		WithWorkdir("/app").
		WithDirectory("/app", b.Source).
		WithEnvVariable("GOARCH", p.Architecture).
		WithEnvVariable("GOOS", p.OS)
}
