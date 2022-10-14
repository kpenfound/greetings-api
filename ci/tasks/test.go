package tasks

import (
	"context"
	"fmt"

	"go.dagger.io/dagger/engine"
	"go.dagger.io/dagger/sdk/go/dagger/api"
)

func Test(ctx context.Context) {
	if err := engine.Start(ctx, &engine.Config{}, func(ctx engine.Context) error {
		core := api.New(ctx.Client)

		builder, err := goBuilder(
			core,
			ctx,
			[]string{"go", "test"},
		)
		if err != nil {
			return err
		}

		// Get Command Output
		out, err := builder.Stdout().Contents(ctx)
		if err != nil {
			return err
		}

		fmt.Println(out)

		return nil
	}); err != nil {
		panic(err)
	}
}
