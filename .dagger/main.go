package main

import (
	"context"
	"fmt"

	"github.com/kpenfound/greetings-api/.dagger/internal/dagger"
)

const (
	APP   = "dagger-demo"
	REPO  = "github.com/kpenfound/greetings-api"
	IMAGE = "kylepenfound/greetings-api:latest"
)

type Greetings struct{}

// Run unit tests for the project
func (g *Greetings) Test(ctx context.Context, source *dagger.Directory) (string, error) {
	backendResult, err := dag.Backend().UnitTest(ctx, source)
	if err != nil {
		return "", err
	}

	return backendResult, nil
}

// Lint the Go code in the project
func (g *Greetings) Lint(ctx context.Context, source *dagger.Directory) (string, error) {
	backendResult, err := dag.Backend().Lint(ctx, source)
	if err != nil {
		return "", err
	}
	return backendResult, nil
}

// Build the backend and frontend for a specified environment
func (g *Greetings) Build(source *dagger.Directory, env string) *dagger.Directory {
	return dag.Directory().
		WithFile("/build/greetings-api", dag.Backend().Binary(source)).
		WithDirectory("build/website/", dag.Frontend().Build(source.Directory("website"), dagger.FrontendBuildOpts{Env: env}))
}

// Serve the backend and frontend to 8080 and 8081 respectively
func (g *Greetings) Serve(source *dagger.Directory) *dagger.Service {
	backendService := dag.Backend().Serve(source)
	frontendService := dag.Frontend().Serve(source.Directory("website"))

	return dag.Proxy().
		WithService(backendService, "backend", 8080, 8080).
		WithService(frontendService, "frontend", 8081, 80).
		Service()
}

// Create a GitHub release
func (g *Greetings) Release(ctx context.Context, source *dagger.Directory, tag string, ghToken *dagger.Secret) (string, error) {
	// Get build
	build := g.Build(source, "netlify")
	// Compress frontend build
	assets := dag.Container().From("alpine:3.18").
		WithDirectory("/assets", build).
		WithWorkdir("/assets/build").
		WithExec([]string{"tar", "czf", "website.tar.gz", "website/"}).
		WithExec([]string{"rm", "-r", "website"}).
		Directory("/assets/build")
	_, _ = assets.Sync(ctx)

	title := fmt.Sprintf("Release %s", tag)
	return title, nil
	//return dag.GithubRelease().Create(ctx, REPO, tag, title, ghToken, dagger.GithubReleaseCreateOpts{Assets: assets})
}


func (g *Greetings) Deploy(ctx context.Context, source *dagger.Directory, flyToken *dagger.Secret, netlifyToken *dagger.Secret, registryUser string, registryPass *dagger.Secret) (string, error) {
	return "", nil
}

// Run the whole CI pipeline
func (g *Greetings) All(
	ctx context.Context,
	source *dagger.Directory,
	// +optional
	release bool,
	// +optional
	tag string,
	// +optional
	infisicalToken *dagger.Secret,
	// +optional
	infisicalProject string,
) (string, error) {
	// Lint
	out, err := g.Lint(ctx, source)
	if err != nil {
		return "", err
	}

	// Test
	testOut, err := g.Test(ctx, source)
	if err != nil {
		return "", err
	}
	out = out + "\n" + testOut

	// Release
	if release && infisicalToken != nil {
		ghToken := dag.Infisical().
			GetSecretByName("GH_RELEASE_TOKEN", "", infisicalProject, "dev")

		// Github Release
		if tag != "" {
			releaseOut, err := g.Release(ctx, source, tag, ghToken)
			if err != nil {
				return "", err
			}
			out = out + "\n" + releaseOut
		}

		flyToken := dag.Infisical().
			GetSecretByName("FLY_TOKEN", "", infisicalProject, "dev")
		netlifyToken := dag.Infisical().
			GetSecretByName("NETLIFY_TOKEN", "", infisicalProject, "dev")
		registryUser, err := dag.Infisical().
			GetSecretByName("DOCKERHUB_USER", "", infisicalProject, "dev").
			Plaintext(ctx)
		if err != nil {
			return "", err
		}
		registryPass := dag.Infisical().
			GetSecretByName("DOCKERHUB_PASSWORD", "", infisicalProject, "dev")

		// Deploy
		deployOut, err := g.Deploy(ctx, source, flyToken, netlifyToken, registryUser, registryPass)
		if err != nil {
			return "", err
		}
		out = out + "\n" + deployOut
	}

	return out, nil
}
