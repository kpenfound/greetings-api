package main

import "context"

type Frontend struct{}

func (g *Frontend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test([]string{"./..."}).
		Container().Stdout(ctx)
}

func (g *Frontend) Build(dir *Directory) *Directory {
	return dag.
		Hugo().
		Build(dir)
}

func (g *Frontend) Serve(dir *Directory) *Service {
	build := dag.
		Hugo().
		Build(dir)

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService()
}

