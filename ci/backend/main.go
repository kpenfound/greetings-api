package main

import "context"

type Backend struct{}

func (b *Backend) Binary(dir *Directory) *File {
	d := b.Build(dir)
	return d.File("greetings-api")
}

func (b *Backend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test(ctx, []string{"./..."})
}

func (b *Backend) Build(dir *Directory) *Directory {
	return dag.
		Golang().
		WithProject(dir).
		Build([]string{})
}

func (b *Backend) Lint(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		GolangciLint(ctx)
}

func (b *Backend) Serve(dir *Directory) *Service {
	bin := b.Binary(dir)
	return dag.
		Container().
		From("cgr.dev/chainguard/wolfi-base:latest").
		WithFile("/bin/greetings-api", bin).
		WithExec([]string{"ls", "-lart", "/bin/greetings-api"}).
		WithExec([]string{"/bin/greetings-api"}).
		WithExposedPort(8080).
		AsService()
}

