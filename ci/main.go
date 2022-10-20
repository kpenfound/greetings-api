package main

import (
	"context"
	"fmt"
	"os"

	"github.com/kpenfound/greetings-api/ci/tasks"
)

func main() {
	ctx := context.Background()

	task := os.Args[1]

	if len(os.Args) != 2 {
		fmt.Println("Please pass a task as an argument")
		os.Exit(1)
	}

	var err error

	switch task {
	case "run":
		fmt.Printf("I dont run yet")
	case "test":
		err = tasks.Test(ctx)
	case "push":
		err = tasks.Push(ctx)
	default:
		fmt.Printf("Unknown task %s\n", task)
		os.Exit(1)
	}

	if err != nil {
		fmt.Printf("failed to run task %s: %+v\n", task, err)
	}
}
