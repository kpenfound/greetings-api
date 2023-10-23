package main

import "context"

type Greetings struct{}

func (g *Greetings) Binary(ctx context.Context) *File {
	d := g.Build(ctx)
	return d.File("greetings-api")
}

func (g *Greetings) UnitTest(ctx context.Context) (string, error) {
	return dag.
		Golang().
		WithProject(project()).
		Test([]string{"./..."}).
		Container().Stdout(ctx)
}

func (g *Greetings) Build(ctx context.Context) *Directory {
	return dag.
		Golang().
		WithProject(project()).
		Build([]string{}).
		Project()
}

func project() *Directory {
	return dag.Host().Directory(".")
}
