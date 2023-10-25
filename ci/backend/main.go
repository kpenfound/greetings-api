package main

import "context"

type Backend struct{}

func (g *Backend) Binary(ctx context.Context, dir *Directory) *File {
	d := g.Build(ctx, dir)
	return d.File("greetings-api")
}

func (g *Backend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test([]string{"./..."}).
		Container().Stdout(ctx)
}

func (g *Backend) Build(ctx context.Context, dir *Directory) *Directory {
	return dag.
		Golang().
		WithProject(dir).
		Build([]string{}).
		Project()
}

func (g *Backend) Serve(ctx context.Context, dir *Directory) *Service {
	return dag.
		Golang().
		WithProject(dir).
		Container().
		WithExposedPort(8080).
		WithEntrypoint([]string{"go", "run", "main.go"}).
		AsService()
}

