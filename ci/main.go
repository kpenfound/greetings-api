package main

import (
	"context"
	"fmt"
)

type Greetings struct{}

func (g *Greetings) UnitTest(ctx context.Context, dir *Directory) (string, error) {
	backendResult, err := dag.Backend().UnitTest(ctx, dir)
	if err != nil {
		return "", err
	}

	frontendResult, err := dag.Frontend().UnitTest(ctx, dir.Directory("website"))
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("BACKEND\n\n%s\n\nFRONTEND\n\n%s", backendResult, frontendResult), nil

}

func (g *Greetings) Lint(ctx context.Context, dir *Directory) (string, error) {
	backendResult, err := dag.Backend().Lint(ctx, dir)
	if err != nil {
		return "", err
	}
	frontendResult, err := dag.Frontend().Lint(ctx, dir.Directory("website"))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("BACKEND\n\n%s\n\nFRONTEND\n\n%s", backendResult, frontendResult), nil
}

func (g *Greetings) Build(dir *Directory) *Directory {
	return dag.Backend().Build(dir).WithDirectory("website/", dag.Frontend().Build(dir.Directory("website"), FrontendBuildOpts{ Env: "netlify" }))
}

func (g *Greetings) Serve(dir *Directory) *Service {
	backendService := dag.Backend().Serve(dir)
	frontendService := dag.Frontend().Serve(dir.Directory("website"))

	proxy := dag.Proxy().Proxy(backendService, "backend", 8080)
	proxy = dag.Proxy().AdditionalProxy(proxy, frontendService, "frontend", 8081)

	return dag.Proxy().Service(proxy)
}

func (g *Greetings) Deploy(ctx context.Context, dir *Directory, flyToken *Secret, netlifyToken *Secret) (string, error) {
	// Backend
	imageTag := "kylepenfound/greetings-api:latest"
	backendAmd64 := dag.Backend().Container(dir, BackendContainerOpts{ Arch: "amd64"})
	backendArm64 := dag.Backend().Container(dir, BackendContainerOpts{ Arch: "arm64"})
	_, err := dag.Container().Publish(ctx, imageTag, ContainerPublishOpts{
		PlatformVariants: []*Container{
			backendAmd64,
			backendArm64,
		},
	})
	if err != nil {
		return "", err
	}
	backendResult, err := fly_deploy(ctx, imageTag, flyToken) // Pass tag. Fly isn't happy with full shas
	if err != nil {
		return "", err
	}
	// Frontend
	frontend := dag.Frontend().Build(dir.Directory("website"), FrontendBuildOpts{ Env: "netlify" })
	frontendResult, err := netlify_deploy(ctx, frontend, netlifyToken)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("BACKEND\n\n%s\n\nFRONTEND\n\n%s", backendResult, frontendResult), nil
}

func fly_deploy(ctx context.Context, imageRef string, token *Secret) (string, error) {
	app := "dagger-demo"
	out, err := dag.Fly().Deploy(ctx, app, imageRef, token)
	return out, err
}

func netlify_deploy(ctx context.Context, dir *Directory, token *Secret) (string, error) {
	site := "dagger-demo"
	out, err := dag.Netlify().Deploy(ctx, dir, token, site)
	return out, err
}

