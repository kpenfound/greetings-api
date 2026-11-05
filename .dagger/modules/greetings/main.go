package main

import (
	"errors"

	"github.com/kpenfound/greetings-api/.dagger/modules/greetings/internal/dagger"
)

type Greetings struct {
	// +private
	BackendBinary *dagger.File
	// +private
	Frontend *dagger.Frontend
	Sec      *dagger.Secret
}

func New(
	// The secret to set
	sec *dagger.Secret,
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
		Sec: sec,
	}
}

// Build the backend and frontend for a specified environment
func (g *Greetings) Build() *dagger.Directory {
	return dag.Directory().
		WithFile("/build/greetings-api", g.BackendBinary).
		WithDirectory("build/website/", g.Frontend.Build())
}

// Check a check
// +check
func (g *Greetings) IsSec() error {
	if g.Sec == nil {
		return errors.New("a secret was not set")
	}
	return nil
}
