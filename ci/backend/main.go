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
		Test([]string{"./..."}).
		Container().Stdout(ctx) // TODO: dont breakout to container. Store test result some other way.
}

func (b *Backend) Build(dir *Directory) *Directory {
	return dag.
		Golang().
		WithProject(dir).
		Build([]string{}).
		Project()
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

