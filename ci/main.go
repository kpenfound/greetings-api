package main

import (
	"context"
	"fmt"
	"os"

	"github.com/kpenfound/greetings-api/ci/tasks"
)

const (
	golangImage    = "golang:latest"
	baseImage      = "alpine:latest"
	publishAddress = "ghcr.io/kpenfound/hello-container:latest"
)

func main() {
	ctx := context.Background()

	task := os.Args[1]

	if len(os.Args) != 2 {
		fmt.Println("Please pass a task as an argument")
		os.Exit(1)
	}

	switch task {
	case "run":
		fmt.Printf("I dont run yet")
	case "test":
		tasks.Test(ctx)
	case "push":
		tasks.Push(ctx)
	default:
		fmt.Printf("Unknown task %s\n", task)
		os.Exit(1)
	}
}
