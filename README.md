# greetings-api

A simple greeting api with a beatuiful frontend.

## Try it out!

### Functions

List all functions:
```
dagger functions
```

Run go tests:
```
dagger call go-test
```

### Checks
A module can define pass/fail functions to validate the codebase with the `@check` decorator. These are the types of functions you would run pre-push and in CI.

List all checks:
```
dagger check -l
```

Run all checks concurrently:
```
dagger check
```

### Generators
A module can define code generation functions with the `@generate` decorator. Generators could be formatters, linters that can auto fix, generated code, or generated assets.

List all generators:
```
dagger generate -l
```

Run all generators concurrently:
```
dagger generate
```

### Services
A module can define services to be available with the `@up` decorator. These are similar to what you'd define in a docker compose.

List all services:
```
dagger up -l
```

Run all services concurrently:
```
dagger up
```

Navigate to [localhost:8081](http://localhost:8081)
