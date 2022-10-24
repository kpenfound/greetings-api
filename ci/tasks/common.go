package tasks

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecs"
	"github.com/spdx/tools-golang/builder"
	"github.com/spdx/tools-golang/tvsaver"
	"go.dagger.io/dagger/sdk/go/dagger"
	"go.dagger.io/dagger/sdk/go/dagger/api"

	"github.com/sigstore/cosign/cmd/cosign/cli/options"
	"github.com/sigstore/cosign/cmd/cosign/cli/sign"
)

const (
	golangImage    = "golang:latest"
	baseImage      = "alpine:latest"
	publishAddress = "kylepenfound/greetings:latest"
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

// TODO: deps and vulns
func sbom() error {
	fileout := fmt.Sprintf("%s_sbom.rdf", publishAddress)
	config := &builder.Config2_2{
		NamespacePrefix: "https://github.com/kpenfound/greetings-api",
		CreatorType:     "Person",
		Creator:         "kpenfound",
		PathsIgnored: []string{
			"/.git/",
			"/.vscode/",
		},
	}

	workdir, err := os.Getwd()
	if err != nil {
		return err
	}
	doc, err := builder.Build2_2(publishAddress, workdir, config)
	if err != nil {
		return err
	}

	w, err := os.Create(fileout)
	if err != nil {
		return err
	}
	defer w.Close()

	return tvsaver.Save2_2(doc, w)

}

// TODO: expand key options
func cosignSign(image string, key string) error {
	args := []string{image}
	o := &options.SignOptions{
		Upload:           true,
		Key:              key,
		Force:            false,
		Recursive:        false,
		SkipConfirmation: false,
		NoTlogUpload:     false,
	}
	ro := &options.RootOptions{
		Timeout: 3 * time.Minute,
		Verbose: false,
	}
	ko := options.KeyOpts{
		KeyRef: o.Key,
	}
	annotationsMap, err := o.AnnotationsMap()
	if err != nil {
		return err
	}

	fmt.Printf("Signing %s\n", image)
	return sign.SignCmd(ro, ko, o.Registry, annotationsMap.Annotations, args, o.Cert, o.CertChain, o.Upload,
		o.OutputSignature, o.OutputCertificate, o.PayloadPath, o.Force, o.Recursive, o.Attachment, o.NoTlogUpload)
}
