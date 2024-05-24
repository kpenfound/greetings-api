package main

import "context"

type Frontend struct{}

// Test the frontend
func (f *Frontend) UnitTest(ctx context.Context, source *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(source).
		Test(ctx)
}

// Build the frontend hugo static site
func (f *Frontend) Build(
	source *Directory,
	// +optional
	// +default "dev"
	env string,
) *Directory {
	return dag.
		Hugo().
		Build(source, HugoBuildOpts{HugoEnv: env})
}

// Lint the frontend Go code
func (f *Frontend) Lint(ctx context.Context, source *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(source).
		GolangciLint(ctx)
}

// Get a service to run the frontend webservice
func (f *Frontend) Serve(source *Directory) *Service {
	build := f.Build(source, "dev")

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService()
}
