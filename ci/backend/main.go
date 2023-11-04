package main

import (
	"context"
	"runtime"
)


type Backend struct{}

func (b *Backend) Binary(dir *Directory, arch Optional[string]) *File {
	d := b.Build(dir, arch)
	return d.File("greetings-api")
}

func (b *Backend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test(ctx, []string{"./..."})
}

func (b *Backend) Build(dir *Directory, arch Optional[string]) *Directory {
	archStr := arch.GetOr(runtime.GOARCH)
	return dag.
		Golang().
		WithProject(dir).
		Build([]string{}, GolangBuildOpts{ Arch: archStr })
}

func (b *Backend) Lint(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		GolangciLint(ctx)
}

func (b *Backend) Container(dir *Directory, arch Optional[string]) *Container {
	archStr := arch.GetOr(runtime.GOARCH)
	bin := b.Binary(dir, arch)
	return dag.
		Container(ContainerOpts{ Platform: Platform(archStr)}).
		From("cgr.dev/chainguard/wolfi-base:latest").
		WithFile("/bin/greetings-api", bin).
		WithEntrypoint([]string{"/bin/greetings-api"}).
		WithExposedPort(8080)
}

func (b *Backend) Serve(dir *Directory) *Service {
	return b.Container(dir, Opt(runtime.GOARCH)).AsService()
}

