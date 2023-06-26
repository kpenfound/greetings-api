package tasks

import (
	"context"
	"fmt"

	"dagger.io/dagger"
)

func Test(client *dagger.Client, ctx context.Context) error {
	src := client.Host().Directory(".", dagger.HostDirectoryOpts{
		Exclude: []string{
			".circleci/*",
			".github/*",
			"ci/*",
			"terraform/*",
			"output/*",
		},
	})

	testoutput := client.Directory()
	cacheKey := "gomods"
	cache := client.CacheVolume(cacheKey)

	// multiplatform tests
	goversions := []string{"1.18", "1.19"}

	for _, goversion := range goversions {
		image := fmt.Sprintf("golang:%s", goversion)
		builder := client.Container().
			From(image).
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithMountedCache("/cache", cache).
			WithEnvVariable("GOMODCACHE", "/cache").
			WithExec([]string{"sh", "-c", "go test > /src/test.out"})

		// Get Command Output
		outputfile := fmt.Sprintf("output/%s.out", goversion)
		testoutput = testoutput.WithFile(
			outputfile,
			builder.File("/src/test.out"),
		)
	}

	_, err := testoutput.Export(ctx, ".")
	if err != nil {
		return err
	}

	return nil
}
