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

	src := client.Host().Workdir()

	testoutput := client.Directory()

	// multiplatform tests
	goversions := []string{"1.18", "1.19"}
	platforms := []dagger.Platform{"linux/amd64", "linux/arm64"}

	for _, plat := range platforms {
		for _, goversion := range goversions {
			image := fmt.Sprintf("golang:%s", goversion)
			builder := client.Container(dagger.ContainerOpts{Platform: plat}).
				From(image).
				WithMountedDirectory("/src", src).
				WithWorkdir("/src").
				WithEnvVariable("CGO_ENABLED", "0").
				Exec(dagger.ContainerExecOpts{
					Args: []string{"go", "test"},
				})

			// Get Command Output
			outputfile := fmt.Sprintf("output/%s/%s.out", string(plat), goversion)
			testoutput = testoutput.WithFile(
				outputfile,
				builder.Stdout(),
			)
		}
	}

	_, err = testoutput.Export(ctx, ".")
	if err != nil {
		return err
	}

	return nil
}
