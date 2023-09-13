package main

import "context"

type Greetings struct{}

func (m *Greetings) HelloWorld(context.Context) (string, error) {
	return dag.Golang().Base("latest").WithExec([]string{"echo", "hello", "world"}).Stdout(ctx)
}

func (g *Greetings) Binary(ctx context.Context) (*File, error) {
	d, err := g.Build(ctx)
	if err != nil {
		return nil, err
	}
	return d.File("greetings-api"), nil
}

func (g *Greetings) UnitTest(ctx context.Context) (string, error) {
	b := dag.
		Golang().Base("1.21").
		WithDirectory("/src", project()).
		WithWorkdir("/src").
		GoTest([]string{"./..."})

	return b.Stdout(ctx)
}

// func (g *Greetings) Lint(ctx context.Context) (string, error) {
// 	return project().GoLint(ctx)
// }

func (g *Greetings) Build(ctx context.Context) (*Directory, error) {
	b := dag.
		Golang().Base("1.21").
		WithDirectory("/src", project()).
		WithWorkdir("/src").
		GoBuild([]string{})

	return b.Directory("/src"), nil
}

func project() *Directory {
	return dag.Host().Directory(".")
}
