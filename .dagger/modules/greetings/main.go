package main

import (
	"github.com/kpenfound/greetings-api/.dagger/modules/greetings/internal/dagger"
)

type Greetings struct {
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
) *Greetings {
	g := &Greetings{
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
