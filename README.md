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

## Runs on ECS Fargate!

Check out the infrastructure defined under /terraform. It creates everything needed to run
an api on ECS Fargate with a load balancer.

## CICD with Dagger

- `go run ci/main.go test`
- `go run ci/main.go push`
