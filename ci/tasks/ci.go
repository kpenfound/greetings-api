package tasks

import (
	"context"

	"dagger.io/dagger"
)

func Ci(client *dagger.Client, ctx context.Context) error {
	// lint
	err := Lint(client.Pipeline("lint"), ctx)
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
