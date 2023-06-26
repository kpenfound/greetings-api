package tasks

import (
	"context"

	"dagger.io/dagger"
)

func Lint(client *dagger.Client, ctx context.Context) error {
	src := client.Host().Directory(".", dagger.HostDirectoryOpts{
		Exclude: []string{
			".circleci/*",
			".github/*",
			"ci/*",
			"terraform/*",
			"output/*",
		},
	})

	_, err := client.Container().
		From("golangci/golangci-lint:v1.48").
		WithMountedDirectory("/src", src).
		WithWorkdir("/src").
		WithExec([]string{"golangci-lint", "run", "-v", "--timeout", "5m"}).
		ExitCode(ctx)
	return err
}
