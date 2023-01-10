package tasks

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

var archs = []string{"amd64", "arm64"}

func Build(ctx context.Context) error {
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		return err
	}
	defer client.Close()

	// get project dir
	src := client.Host().Directory(".")

	buildoutput := client.Directory()
	cacheKey := "gomods"
	cache := client.CacheVolume(cacheKey)

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
				WithMountedCache("/cache", cache).
				WithEnvVariable("GOMODCACHE", "/cache").
				WithExec([]string{"go", "build", "-o", "/src/greetings-api"})

			// Get Command Output
			outputfile := fmt.Sprintf("output/%s/%s/greetings-api", string(plat), goversion)
			buildoutput = buildoutput.WithFile(
				outputfile,
				builder.File("/src/greetings-api"),
			)
		}
	}

	_, err = buildoutput.Export(ctx, ".")
	if err != nil {
		return err
	}

	return nil
}
