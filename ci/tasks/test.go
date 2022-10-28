package tasks

import (
	"context"

	"dagger.io/dagger"
)

func Test(ctx context.Context) error {
	client, err := dagger.Connect(ctx)
	if err != nil {
		return err
	}
	defer client.Close()

	// builder, err := goBuilder(
	// 	client,
	// 	ctx,
	// 	[]string{"go", "test"},
	// )
	// if err != nil {
	// 	return err
	// }

	// // Get Command Output
	// out, err := builder.Stdout().Contents(ctx)
	// if err != nil {
	// 	return err
	// }

	//fmt.Println(out)
	//addr := "cgr.dev/chainguard/nginx:latest"
	return sbom()

	//return nil
}
