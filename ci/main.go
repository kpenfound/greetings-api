package main

import (
	"context"
)

func main() {
	dag.Environment().
		WithCheck(UnitTest).
		WithCheck(Lint).
		WithCheck(Build).
		WithArtifact(Binary).
		Serve()
}

func buildBase(ctx context.Context) *Container {
	return dag.Apko().Wolfi([]string{"go-1.20"})
}

func Binary(ctx context.Context) *File {
        return dag.Go().Build(
                buildBase(ctx),
                dag.Host().Directory("."),
                GoBuildOpts{
                        Static:   true,
                        Packages: []string{"."},
                },
        ).File("greetings-api")
}

func UnitTest(ctx context.Context) *EnvironmentCheck {
	return dag.Go().Test(
		buildBase(ctx),
		dag.Host().Directory("."),
		GoTestOpts{
			Packages: []string{"."},
			Verbose: true,
		},
	)
}

func Lint(ctx context.Context) *EnvironmentCheck {
	l := dag.Go().GolangCilint(
		buildBase(ctx).WithExec([]string{"apk", "add", "golangci-lint"}),
		dag.Host().Directory("."),
		GoGolangCilintOpts{},
	)
	return dag.EnvironmentCheck().
	WithDescription("Go Lint").
	WithContainer(l)
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
