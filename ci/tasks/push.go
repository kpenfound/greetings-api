package tasks

import (
	"context"
	"fmt"

	"dagger.io/dagger"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
)

var platformToArch = map[dagger.Platform]string{
	"linux/amd64": "amd64",
	"linux/arm64": "arm64",
}

func Push(client *dagger.Client, ctx context.Context) error {
	// get project dir
	src := client.Host().Directory(".")

	variants := make([]*dagger.Container, 0, len(platformToArch))
	for platform, arch := range platformToArch {
		// assemble golang build
		builder := client.Container().
			From("golang:latest").
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithEnvVariable("CGO_ENABLED", "0").
			WithEnvVariable("GOOS", "linux").
			WithEnvVariable("GOARCH", arch).
			WithExec([]string{"go", "build", "-o", "/src/greetings-api"})

		// Build container on production base with build artifact
		base := client.Container(dagger.ContainerOpts{Platform: platform}).
			From("alpine").
			WithFile("/bin/greetings-api", builder.File("/src/greetings-api")).
			WithEntrypoint([]string{"/bin/greetings-api"})
		// add built container to container variants
		variants = append(variants, base)
	}
	// Publish all images
	addr, err := client.Container().Publish(
		ctx,
		"public.ecr.aws/t5t3s6c1/hello:latest",
		dagger.ContainerPublishOpts{
			PlatformVariants: variants,
		})
	if err != nil {
		return err
	}

	fmt.Println(addr)

	// Create ECS task deployment
	svc := ecs.New(session.New(&aws.Config{
		Region: aws.String("us-east-1"),
	}))
	input := &ecs.UpdateServiceInput{
		Service:            aws.String("greetings"),
		Cluster:            aws.String("greetings"),
		ForceNewDeployment: aws.Bool(true),
	}

	_, err = svc.UpdateService(input)
	if err != nil {
		return err
	}
	fmt.Println("Created ECS task deployment")

	return nil
}
