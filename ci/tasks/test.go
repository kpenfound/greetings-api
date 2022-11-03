package tasks

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

func Test(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		return err
	}
	defer client.Close()

	builder := goBuilder(
		client,
		ctx,
		[]string{"go", "test"},
	)

	// Get Command Output
	out, err := builder.Stdout().Contents(ctx)
	if err != nil {
		return err
	}

	fmt.Println(out)

	return nil
}
