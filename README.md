# hello

A simple hello world app

```
> go run main.go
Hello
```

Try it out!

- `mage run`
- `mage test`

Dagger is executed in the magefile `magefiles/main.go`

The `Run` and `Test` tasks each load the dagger engine, load a go image, load the working directory, and run a command