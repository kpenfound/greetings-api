# greetings-api

A simple greeting api

## Try it out!

```
> go run main.go
...
listening on :8080
```

```
> curl -s http://localhost:8080 | jq
{
  "greeting": "Hello"
}
```
## Dagger CI

stuff

## TODO

modules:
- backend
    - go test/build - github.com/kpenfound/dagger-modules/golang
    - golangci-lint - github.com/kpenfound/dagger-modules/golang
- frontend
    - hugo - github.com/jedevc/daggerverse/hugo
- deploy
    - fly.io
    - netlify
    - vercel
    - helm?
    - github release

