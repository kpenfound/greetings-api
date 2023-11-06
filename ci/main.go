package main

import (
	"context"
	"fmt"
)

const (
	APP = "dagger-demo"
	REPO = "github.com/kpenfound/greetings-api"
	IMAGE = "kylepenfound/greetings-api:latest"
)

type Greetings struct{}

// Run unit tests for the project
func (g *Greetings) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	backendResult, err := dag.Backend().UnitTest(ctx, dir)
	if err != nil {
		return "", err
	}

	return backendResult, nil
}

// Lint the Go code in the project
func (g *Greetings) Lint(ctx context.Context, dir *Directory) (string, error) {
	backendResult, err := dag.Backend().Lint(ctx, dir)
	if err != nil {
		return "", err
	}
	return backendResult, nil
}

// Build the backend and frontend for a specified environment
func (g *Greetings) Build(dir *Directory, env string) *Directory {
	return dag.Directory().
		WithFile("/build/greetings-api", dag.Backend().Binary(dir)).
		WithDirectory("build/website/", dag.Frontend().Build(dir.Directory("website"), FrontendBuildOpts{Env: env}))
}

// Serve the backend and frontend to 8080 and 8081 respectively
func (g *Greetings) Serve(dir *Directory) *Service {
	backendService := dag.Backend().Serve(dir)
	frontendService := dag.Frontend().Serve(dir.Directory("website"))

	return dag.Proxy().
		WithService(backendService, "backend", 8080, 8080).
		WithService(frontendService, "frontend", 8081, 80).
		Service()
}

// Create a GitHub release
func (g *Greetings) Release(ctx context.Context, dir *Directory, tag string, ghToken *Secret) (string, error) {
	// Get build
	build := g.Build(dir, "netlify")
	// Compress frontend build
	assets := dag.Container().From("alpine:3.18").
		WithDirectory("/assets", build).
		WithWorkdir("/assets/build").
		WithExec([]string{"tar", "czf", "website.tar.gz", "website/"}).
		WithExec([]string{"rm", "-r", "website"}).
		Directory("/assets/build")

	title := fmt.Sprintf("Release %s", tag)

	return dag.GithubRelease().Create(ctx, REPO, tag, title, ghToken, GithubReleaseCreateOpts{Assets: assets})
}

// Deploy the project to fly and netlify
func (g *Greetings) Deploy(ctx context.Context, dir *Directory, flyToken *Secret, netlifyToken *Secret, registryUser string, registryPass *Secret) (string, error) {
	// Backend multiarch image
	backendAmd64 := dag.Backend().Container(dir, BackendContainerOpts{Arch: "amd64"})
	backendArm64 := dag.Backend().Container(dir, BackendContainerOpts{Arch: "arm64"})
	_, err := dag.Container().
		WithRegistryAuth(
			"index.docker.io",
			registryUser,
			registryPass,
		).
		Publish(ctx, IMAGE, ContainerPublishOpts{
			PlatformVariants: []*Container{
				backendAmd64,
				backendArm64,
			},
	})
	if err != nil {
		return "", err
	}
	// Deploy backend image to Fly
	backendResult, err := dag.Fly().Deploy(ctx, APP, IMAGE, flyToken)
	if err != nil {
		return "", err
	}
	// Frontend
	frontend := dag.Frontend().Build(dir.Directory("website"), FrontendBuildOpts{Env: "netlify"})
	// Deploy frontend build to Netlify
	frontendResult, err := dag.Netlify().Deploy(ctx, frontend, netlifyToken, APP)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("BACKEND\n\n%s\n\nFRONTEND\n\n%s", backendResult, frontendResult), nil
}

// Run the whole CI pipeline
func (g *Greetings) Ci(
	ctx context.Context,
	dir *Directory,
	release Optional[bool],
	tag Optional[string],
	infisicalToken Optional[*Secret],
) (string, error) {
	// Lint
	out, err := g.Lint(ctx, dir)
	if err != nil {
		return "", err
	}

	// Test
	testOut, err := g.UnitTest(ctx, dir)
	if err != nil {
		return "", err
	}
	out = out + "\n" + testOut

	infisical, isset := infisicalToken.Get()

	// Release
	if release.GetOr(false) && isset {
		tag_, tagSet := tag.Get()
		ghToken := dag.Infisical().GetSecret("GH_RELEASE_TOKEN", infisical, "dev", "/")

		// Github Release
		if tagSet {
			releaseOut, err := g.Release(ctx, dir, tag_, ghToken)
			if err != nil {
				return "", err
			}
			out = out + "\n" + releaseOut
		}

		flyToken := dag.Infisical().GetSecret("FLY_TOKEN", infisical, "dev", "/")
		netlifyToken := dag.Infisical().GetSecret("NETLIFY_TOKEN", infisical, "dev", "/")
		registryUser, err := dag.Infisical().GetSecret("DOCKERHUB_USER", infisical, "dev", "/").Plaintext(ctx)
		if err != nil {
			return "", err
		}
		registryPass := dag.Infisical().GetSecret("DOCKERHUB_PASSWORD", infisical, "dev", "/")

		// Deploy
		deployOut, err := g.Deploy(ctx, dir, flyToken, netlifyToken, registryUser, registryPass)
		if err != nil {
			return "", err
		}
		out = out + "\n" + deployOut
	}

	return out, nil
}

// Run the whole CI pipeline for a particular commit
func (g *Greetings) CiRemote(
	ctx context.Context,
	commit string,
	release Optional[bool],
	tag Optional[string],
	infisicalToken Optional[*Secret],
) (string, error) {
	dir := dag.Git(fmt.Sprintf("https://%s", REPO)).
		Commit(commit).
		Tree()

	return g.Ci(
		ctx,
		dir,
		release,
		tag,
		infisicalToken,
	)
}


func netlify_deploy(ctx context.Context, dir *Directory, token *Secret) (string, error) {
	out, err := dag.Netlify().Deploy(ctx, dir, token, APP)
	return out, err
}
