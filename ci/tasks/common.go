package tasks

import (
	"context"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
	"go.dagger.io/dagger/sdk/go/dagger"
	"go.dagger.io/dagger/sdk/go/dagger/api"
)

const (
	golangImage    = "golang:latest"
	baseImage      = "alpine:latest"
	publishAddress = "518461225764.dkr.ecr.us-east-1.amazonaws.com/greetings:latest"
	ecsService     = "greetings"
)

func goBuilder(core *dagger.Client, ctx context.Context, command []string) (*api.Container, error) {
	// Load image
	builder := core.Core().Container().From(golangImage)

	// Set workdir
	src, err := core.Core().Host().Workdir().Read().ID(ctx)
	if err != nil {
		return nil, err
	}
	builder = builder.WithMountedDirectory("/src", src).WithWorkdir("/src")
	builder = builder.WithEnvVariable("CGO_ENABLED", "0")
	builder = builder.WithEnvVariable("GOARCH", "amd64")
	builder = builder.WithEnvVariable("GOOS", "linux")

	// Execute Command
	builder = builder.Exec(api.ContainerExecOpts{
		Args: command,
	})
	return builder, nil
}

func deployGreetingsService() error {
	svc := ecs.New(session.New(&aws.Config{
		Region: aws.String("us-east-1"),
	}))
	input := &ecs.UpdateServiceInput{
		Service:            aws.String(ecsService),
		Cluster:            aws.String(ecsService),
		ForceNewDeployment: aws.Bool(true),
	}

	_, err := svc.UpdateService(input)
	return err
}
