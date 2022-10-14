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


## CICD with Dagger

- `go run ci/main.go test`
- `go run ci/main.go push`
