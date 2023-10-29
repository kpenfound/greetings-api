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
	return dag.Backend().Build(dir).WithDirectory("website/", dag.Frontend().Build(dir.Directory("website")))
}

func (g *Greetings) Serve(dir *Directory) *Service {
	backendService := dag.Backend().Serve(dir)
	frontendService := dag.Frontend().Serve(dir.Directory("website"))

	proxy := dag.Proxy().Proxy(backendService, "backend", 8080)
	proxy = dag.Proxy().AdditionalProxy(proxy, frontendService, "frontend", 8081)

	return dag.Proxy().Service(proxy)
}

