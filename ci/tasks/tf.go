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
	tfdirectory := client.Host().Directory("terraform")

	// Load terraform image
	tf := client.Container().From("hashicorp/terraform:latest")

	// Mount terraform to container workdir
	tf = tf.WithMountedDirectory("/terraform", tfdirectory)
	tf = tf.WithWorkdir("/terraform")

	// Pass through TF_TOKEN for Terraform Cloud
	tkn := os.Getenv("TF_TOKEN")
	tf = tf.WithEnvVariable("TF_TOKEN_app_terraform_io", tkn)

	// terraform init
	tf = tf.Exec(dagger.ContainerExecOpts{
		Args: []string{"init"},
	})

	// Set command
	tf = tf.Exec(dagger.ContainerExecOpts{
		Args: tfcommand,
	})

	// Execute against dagger engine
	_, err = tf.ExitCode(ctx)

	return err
}
