package main

import (
	"github.com/kpenfound/greetings-api/.dagger/modules/greetings/internal/dagger"
)

type Greetings struct {
	// +private
	BackendBinary *dagger.File
	// +private
	Frontend *dagger.Frontend
}

func New(
	// +optional
	// +defaultPath="/"
	// +ignore=[".git", "**/node_modules"]
	source *dagger.Directory,
	// The compiled backend binary. dagger.toml wires this to the go module's
	// build of the root package.
	backendBinary *dagger.File,
) *Greetings {
	return &Greetings{
		BackendBinary: backendBinary,
		Frontend: dag.Frontend(dagger.FrontendOpts{
			Source: source.Directory("website"),
		}),
	}
}

// Build the backend and frontend for a specified environment
func (g *Greetings) Build() *dagger.Directory {
	return dag.Directory().
		WithFile("/build/greetings-api", g.BackendBinary).
		WithDirectory("build/website/", g.Frontend.Build())
}
