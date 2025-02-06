package main

import (
	"context"
	"frontend/internal/dagger"
)

type Frontend struct {
	Source *dagger.Directory
}

func New(source *dagger.Directory) *Frontend {
	return &Frontend{
		Source: source,
	}
}

// Test the frontend
func (f *Frontend) UnitTest(ctx context.Context) (string, error) {
	return dag.
		Golang().
		WithProject(f.Source).
		Test(ctx)
}

// Build the frontend hugo static site
func (f *Frontend) Build(
	// +optional
	// +default "dev"
	env string,
) *dagger.Directory {
	base := dag.Container().From("golang:alpine").
		WithExec([]string{"apk", "add", "git"})
	hugo := dag.Hugo("0.143.1").Container(base)
	return hugo.
		WithDirectory("/src", f.Source).
		WithWorkdir("/src").
		WithExec([]string{"hugo", "--environment", env}).
		Directory("/src/public")
}

// Lint the frontend Go code
func (f *Frontend) Lint(ctx context.Context) (string, error) {
	return dag.
		Golang().
		WithProject(f.Source).
		GolangciLint(ctx)
}

// Get a service to run the frontend webservice
func (f *Frontend) Serve() *dagger.Service {
	build := f.Build("dev")

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService(dagger.ContainerAsServiceOpts{UseEntrypoint: true})
}
