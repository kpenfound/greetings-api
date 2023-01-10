package tasks

import (
	"context"
	"os"

	"dagger.io/dagger"
)

func Lint(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return err
	}
	defer client.Close()

	src := client.Host().Directory(".", dagger.HostDirectoryOpts{
		Exclude: []string{
			".circleci/*",
			".github/*",
			"ci/*",
			"terraform/*",
			"output/*",
		},
	})

	_, err = client.Container().
		From("golangci/golangci-lint:v1.48").
		WithMountedDirectory("/src", src).
		WithWorkdir("/src").
		WithExec([]string{"golangci-lint", "run", "-v", "--timeout", "5m"}).
		ExitCode(ctx)
	return err
}
