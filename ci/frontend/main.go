package main

import "context"

type Frontend struct{}

func (f *Frontend) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		Test(ctx, []string{"./..."})
}

func (f *Frontend) Build(dir *Directory, env Optional[string]) *Directory {
	envStr := env.GetOr("dev")
	return dag.
		Hugo().
		Build(dir, HugoBuildOpts{ HugoEnv: envStr })
}

func (f *Frontend) Lint(ctx context.Context, dir *Directory) (string, error) {
	return dag.
		Golang().
		WithProject(dir).
		GolangciLint(ctx)
}

func (f *Frontend) Serve(dir *Directory) *Service {
	build := f.Build(dir, Opt[string]("dev"))

	return dag.Container().From("nginx").
		WithDirectory("/usr/share/nginx/html", build).
		WithExposedPort(80).
		AsService()
}

