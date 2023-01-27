package main

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

func main() {
	ctx := context.Background()
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		panic(err)
	}
	// get project dir
	src := client.Host().Directory(".")

	err = nix(ctx, client, src)
	if err != nil {
		panic(err)
	}

	err = docs(ctx, client, src)
	if err != nil {
		panic(err)
	}

	err = test(ctx, client, src)
	if err != nil {
		panic(err)
	}

	err = build(ctx, client, src)
	if err != nil {
		panic(err)
	}
}

func nix(ctx context.Context, client *dagger.Client, src *dagger.Directory) error {
	_, err := client.
		Pipeline("nix").
		Container().
		From("alpine").
		WithMountedDirectory("/src", src).
		WithWorkdir("/src").
		WithExec([]string{"make", "nix"}).
		ExitCode(ctx)

	return err
}

func docs(ctx context.Context, client *dagger.Client, src *dagger.Directory) error {
	_, err := client.
		Pipeline("docs").
		Container().
		From("alpine").
		WithMountedDirectory("/src", src.Directory("docs")).
		WithWorkdir("/src").
		WithExec([]string{"make", "docs"}).
		ExitCode(ctx)

	return err
}

func test(ctx context.Context, client *dagger.Client, src *dagger.Directory) error {
	testQuery := client.
		Pipeline("test").
		Container().
		From("golang:latest").
		WithMountedDirectory("/src", src).
		WithWorkdir("/src").
		WithExec([]string{"go", "test"})

	_, err := testQuery.ExitCode(ctx)

	return err
}

var platforms = []string{"windows", "linux", "darwin"}

func build(ctx context.Context, client *dagger.Client, src *dagger.Directory) error {
	buildoutput := client.Directory()

	for _, plat := range platforms {
		pipeline := fmt.Sprintf("build-%s", plat)
		builder := client.
			Pipeline(pipeline).
			Container().
			From("golang:latest").
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithEnvVariable("GOOS", plat).
			WithExec([]string{"go", "build", "-o", "/src/greetings-api"})

		// Get Command Output
		outputfile := fmt.Sprintf("output/%s/greetings-api", string(plat))
		buildoutput = buildoutput.WithFile(
			outputfile,
			builder.File("/src/greetings-api"),
		)
	}

	_, err := buildoutput.Export(ctx, ".")
	if err != nil {
		return err
	}

	return nil
}
