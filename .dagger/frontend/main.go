package main

import (
	"context"
	"frontend/internal/dagger"
)

type Frontend struct{}

// Test the frontend
func (f *Frontend) UnitTest(ctx context.Context, source *dagger.Directory) (string, error) {
	return dag.
		Golang().
		WithProject(source).
		Test(ctx)
}

// Build the frontend hugo static site
func (f *Frontend) Build(
	source *dagger.Directory,
	// +optional
	// +default "dev"
	env string,
) *dagger.Directory {
	return dag.
		Hugo().
		Build(source, dagger.HugoBuildOpts{HugoEnv: env})
}

// Lint the frontend Go code
func (f *Frontend) Lint(ctx context.Context, source *dagger.Directory) (string, error) {
	return dag.
		Golang().
		WithProject(source).
		GolangciLint(ctx)
}

// Get a service to run the frontend webservice
func (f *Frontend) Serve(source *dagger.Directory) *dagger.Service {
	build := f.Build(source, "dev")

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService()
}
