// A generated module for Compose functions

package main

import (
	"dagger/compose/internal/dagger"
)

type Compose struct{}

// Returns a container that echoes whatever string argument is provided
func (m *Compose) Serve(composeFile *dagger.File) *dagger.Service {
	return dag.Container().AsService()
}
