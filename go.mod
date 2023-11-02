module github.com/kpenfound/greetings-api

go 1.18

require (
	github.com/rs/cors v1.10.1
	gotest.tools/v3 v3.1.0
)

require (
	github.com/google/go-cmp v0.5.9 // indirect
	github.com/pkg/errors v0.9.1 // indirect
)

replace github.com/docker/docker => github.com/docker/docker v20.10.3-0.20220414164044-61404de7df1a+incompatible

replace dagger.io/dagger => github.com/sipsma/dagger/sdk/go v0.3.2-0.20230831053358-97f7c3fd25b5
