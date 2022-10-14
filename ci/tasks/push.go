package tasks

import (
	"context"
	"fmt"

	"go.dagger.io/dagger/engine"
	"go.dagger.io/dagger/sdk/go/dagger/api"
)

func Push(ctx context.Context) {
	if err := engine.Start(ctx, &engine.Config{}, func(ctx engine.Context) error {
		core := api.New(ctx.Client)

		builder, err := goBuilder(
			core,
			ctx,
			[]string{"go", "build"},
		)
		if err != nil {
			return err
		}

		// Get built binary
		helloBin, err := builder.File("/src/hello").ID(ctx)
		if err != nil {
			return err
		}

		// Get base image for publishing
		base := core.Container().From(baseImage)
		// Add built binary to /bin
		base = base.WithMountedFile("/tmp/hello", helloBin)
		// Copy mounted file to rootfs
		base = base.Exec(api.ContainerExecOpts{
			Args: []string{"cp", "/tmp/hello", "/bin/hello"},
		})
		// Set entrypoint
		base = base.WithEntrypoint([]string{"/bin/hello"})
		// Publish image
		addr, err := base.Publish(ctx, publishAddress)
		if err != nil {
			return err
		}

		fmt.Println(addr)

		return nil
	}); err != nil {
		panic(err)
	}
}
