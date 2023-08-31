package tasks

import (
	"context"

	"dagger.io/dagger"
)

func Lint(client *dagger.Client, ctx context.Context) *dagger.Container {
	src := getSource(client)

	return client.Container().
		From("golangci/golangci-lint:v1.48").
		WithMountedDirectory("/src", src).
		WithWorkdir("/src").
		WithExec([]string{"golangci-lint", "run", "-v", "--timeout", "5m"})
}
