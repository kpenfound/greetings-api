package tasks

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

const (
	baseImage      = "alpine:latest"
	publishAddress = "kylepenfound/greetings:latest"
)

func Push(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		return err
	}
	defer client.Close()

	// Build our app
	builder := goBuilder(
		client,
		ctx,
		[]string{"go", "build"},
	)

	// Get built binary
	greetingsBin := builder.File("/src/greetings-api")
	// Build container on production base with build artifact
	base := client.Container().
		From(baseImage).
		WithMountedFile("/tmp/greetings-api", greetingsBin).
		Exec(dagger.ContainerExecOpts{
			Args: []string{"cp", "/tmp/greetings-api", "/bin/greetings-api"},
		}).
		WithEntrypoint([]string{"/bin/greetings-api"})
	// Publish image
	addr, err := base.Publish(ctx, publishAddress)
	if err != nil {
		return err
	}

	fmt.Println(addr)

	// Create ECS task deployment
	err = deployGreetingsService()
	if err != nil {
		return err
	}
	fmt.Println("Created ECS task deployment")

	return nil
}
