package tasks

import (
	"context"

	"go.dagger.io/dagger/sdk/go/dagger"
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
	addr := "docker.io/kylepenfound/greetings:unsigned@sha256:c9ef73260c513a3e7271cf6646b512e0d7ce1adf8da87f1f160f3707019f273d"
	return cosignSign(addr, "cosign.key")

	//return nil
}
