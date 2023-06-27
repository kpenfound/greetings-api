package tasks

import (
	"context"
	"os"

	"dagger.io/dagger"
)

func Tf(ctx context.Context, subtask string) error {
	var tfcommand []string

	switch subtask {
	case "plan":
		tfcommand = []string{"plan"}
	case "apply":
		tfcommand = []string{"apply", "-auto-approve"}
	case "destroy":
		tfcommand = []string{"apply", "-destroy", "-auto-approve"}
	}

	// Create client
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		return err
	}
	defer client.Close()

	// Load terraform directory
	tfdirectory := getSource(client).Directory("terraform")

	// Pass through TF_TOKEN for Terraform Cloud
	tkn := os.Getenv("TF_TOKEN")

	// Load terraform image, init, and run
	tf := client.Container().
		From("hashicorp/terraform:latest").
		WithMountedDirectory("/terraform", tfdirectory).
		WithWorkdir("/terraform").
		WithEnvVariable("TF_TOKEN_app_terraform_io", tkn).
		WithExec([]string{"init"}).
		WithExec(tfcommand)

	// Execute against dagger engine
	_, err = tf.ExitCode(ctx)

	return err
}
