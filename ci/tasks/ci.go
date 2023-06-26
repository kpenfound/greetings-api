package tasks

import (
	"context"
	"os"

	"dagger.io/dagger"
)

func Ci(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		return err
	}
	defer client.Close()
	// lint
	err = Lint(client.Pipeline("lint"), ctx)
	if err != nil {
		return err
	}
	// test
	err = Test(client.Pipeline("test"), ctx)
	if err != nil {
		return err
	}
	// build
	err = Build(client.Pipeline("build"), ctx)
	if err != nil {
		return err
	}

	return nil
}
