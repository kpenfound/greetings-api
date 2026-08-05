package main

import (
	"context"
	"fmt"

	"github.com/kpenfound/greetings-api/.dagger/internal/dagger"
)

type Greetings struct {
	// +private
	Source *dagger.Directory
	// +private
	Repo string
	// +private
	Image string
	// +private
	App string
	// +private
	Backend *dagger.Backend
	// +private
	Frontend *dagger.Frontend
}

func New(
	// +optional
	// +defaultPath="/"
	// +ignore=[".git", "**/node_modules"]
	source *dagger.Directory,
	// +optional
	// +default="github.com/kpenfound/greetings-api"
	repo string,
	// +optional
	// +default="kylepenfound/greetings-api:latest"
	image string,
	// +optional
	// +default="dagger-demo"
	app string,
) *Greetings {
	g := &Greetings{
		Source: source,
		Repo:   repo,
		Image:  image,
		App:    app,
		Backend: dag.Backend(dagger.BackendOpts{
			Source: source.WithoutDirectory("website"),
		}),
	}
	g.Frontend = dag.Frontend(dagger.FrontendOpts{
		Source: source.Directory("website"),
	})
	return g
}

// Build the backend and frontend for a specified environment
func (g *Greetings) Build() *dagger.Directory {
	return dag.Directory().
		WithFile("/build/greetings-api", g.Backend.Binary()).
		WithDirectory("build/website/", g.Frontend.Build())
}

// Create a GitHub release
func (g *Greetings) Release(ctx context.Context, tag string, ghToken *dagger.Secret) (string, error) {
	// Get build
	build := g.Build()
	// Compress frontend build
	assets := dag.Container().From("alpine:3.18").
		WithDirectory("/assets", build).
		WithWorkdir("/assets/build").
		WithExec([]string{"tar", "czf", "website.tar.gz", "website/"}).
		WithExec([]string{"rm", "-r", "website"}).
		Directory("/assets/build")
	_, _ = assets.Sync(ctx)

	title := fmt.Sprintf("Release %s", tag)
	return dag.GithubRelease().Create(ctx, g.Repo, tag, title, ghToken, dagger.GithubReleaseCreateOpts{Assets: assets})
}
