package main

import "context"

type Frontend struct{}

// Test the frontend
func (f *Frontend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test(ctx)
}

// Build the frontend hugo static site
func (f *Frontend) Build(
	dir *Directory,
	// +optional
	// +default "dev"
	env string,
) *Directory {
	return dag.
		Hugo().
		Build(dir, HugoBuildOpts{ HugoEnv: env })
}

// Lint the frontend Go code
func (f *Frontend) Lint(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		GolangciLint(ctx)
}

// Get a service to run the frontend webservice
func (f *Frontend) Serve(dir *Directory) *Service {
	build := f.Build(dir, "dev")

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService()
}

