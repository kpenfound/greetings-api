package tasks

import (
	"go.dagger.io/dagger/engine"
	"go.dagger.io/dagger/sdk/go/dagger/api"
)

const (
	golangImage    = "golang:latest"
	baseImage      = "alpine:latest"
	publishAddress = "ghcr.io/kpenfound/hello-container:latest"
)

func goBuilder(core *api.Query, ctx engine.Context, command []string) (*api.Container, error) {
	// Load image
	builder := core.Container().From(golangImage)

	// Set workdir
	src, err := core.Host().Workdir().Read().ID(ctx)
	if err != nil {
		return nil, err
	}
	builder = builder.WithMountedDirectory("/src", src).WithWorkdir("/src")

	// Execute Command
	builder = builder.Exec(api.ContainerExecOpts{
		Args: command,
	})
	return builder, nil
}
