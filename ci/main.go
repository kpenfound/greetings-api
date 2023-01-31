package main

import (
	"context"
	"fmt"
	"os"

	"github.com/kpenfound/greetings-api/ci/tasks"
)

func main() {
	ctx := context.Background()

	if len(os.Args) < 2 {
		fmt.Println("Please pass a task as an argument [ test | push | tf ]")
		os.Exit(1)
	}

	task := os.Args[1]

	var err error

	switch task {
	case "gha":
		err = tasks.Gha(ctx)
	case "ci":
		err = tasks.Ci(ctx)
	case "lint":
		err = tasks.Lint(ctx)
	case "test":
		err = tasks.Test(ctx)
	case "build":
		err = tasks.Build(ctx)
	case "push":
		err = tasks.Push(ctx)
	case "tf":
		if len(os.Args) < 3 {
			fmt.Println("Please subtask as an argument to tf [plan | apply | destroy]")
			os.Exit(1)
		}
		subtask := os.Args[2]
		err = tasks.Tf(ctx, subtask)
	default:
		fmt.Printf("Unknown task %s\n", task)
		os.Exit(1)
	}

	if err != nil {
		fmt.Printf("failed to run task %s: %+v\n", task, err)
		os.Exit(1)
	}
}
