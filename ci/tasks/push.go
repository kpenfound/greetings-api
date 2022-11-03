package tasks

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
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

	// Get base image for publishing
	base := client.Container().From(baseImage)
	// Add built binary to /bin
	base = base.WithMountedFile("/tmp/greetings-api", greetingsBin)
	// Copy mounted file to rootfs
	base = base.Exec(dagger.ContainerExecOpts{
		Args: []string{"cp", "/tmp/greetings-api", "/bin/greetings-api"},
	})
	// Set entrypoint
	base = base.WithEntrypoint([]string{"/bin/greetings-api"})
	// Publish image
	addr, err := base.Publish(ctx, publishAddress)
	if err != nil {
		return err
	}

	fmt.Println(addr)

	// SBOM
	err = sbom()
	if err != nil {
		return err
	}
	// TODO : push sbom somewhere

	// cosign sign
	err = cosignSign(addr, "cosign.key")
	if err != nil {
		return err
	}

	// Create ECS task deployment
	err = deployGreetingsService()
	if err != nil {
		return err
	}
	fmt.Println("Created ECS task deployment")

	return nil
}
