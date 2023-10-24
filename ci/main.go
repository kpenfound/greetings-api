package main

import "context"

type Greetings struct{}

func (g *Greetings) Binary(ctx context.Context, dir *Directory) *File {
	d := g.Build(ctx, dir)
	return d.File("greetings-api")
}

func (g *Greetings) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test([]string{"./..."}).
		Container().Stdout(ctx)
}

func (g *Greetings) Build(ctx context.Context, dir *Directory) *Directory {
	return dag.
		Golang().
		WithProject(dir).
		Build([]string{}).
		Project()
}

