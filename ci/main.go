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

	return fmt.Sprintf("BACKEND\n\n%s\n\nFRONTEND\n\n%s", backendResult, frontendResult), err

}
func (g *Greetings) Build(ctx context.Context, dir *Directory) *Directory {
	return dag.Backend().Build(dir).WithDirectory("website/", dag.Frontend().Build(dir.Directory("website")))
}

