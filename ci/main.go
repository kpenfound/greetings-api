package main

import (
	"context"
)

func main() {
	dag.Environment().
		WithCheck(UnitTest).
		WithCheck(Lint).
		WithCheck(Build).
		Serve()
}

func buildBase(ctx context.Context) *Container {
	return dag.Apko().Wolfi([]string{"go-1.20"})
}

func UnitTest(ctx context.Context) *EnvironmentCheck {
	return dag.Go().Test(
		buildBase(ctx),
		dag.Host().Directory("."),
		GoTestOpts{},
	)
}

func Lint(ctx context.Context) *EnvironmentCheck {
	//l := lint(ctx)
	//return dag.EnvironmentCheck().
	//WithDescription("GolangCILint").
	//WithContainer(l)
	l := dag.Go().GolangCilint(
		buildBase(ctx),
		dag.Host().Directory("."),
		GoGolangCilintOpts{},
	)
	return dag.EnvironmentCheck().
	WithDescription("Go Lint").
	WithContainer(l)
}

func lint(ctx context.Context) *Container {
	return dag.Container().
		From("golangci/golangci-lint:v1.50").
		WithMountedDirectory("/src", dag.Host().Directory(".")).
		WithWorkdir("/src").
		WithExec([]string{"go", "mod", "download"}).
		WithExec([]string{"golangci-lint", "run", "-v", "--timeout", "5m"})
}

func Build(ctx context.Context) *EnvironmentCheck {
	b := buildBase(ctx).
	WithMountedDirectory("/src", dag.Host().Directory(".")).
	WithWorkdir("/src").
	WithExec([]string{"go", "build"})

	return dag.EnvironmentCheck().
	WithDescription("Go Build").
	WithContainer(b)
}
