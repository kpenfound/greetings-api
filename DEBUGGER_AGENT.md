# Debugger Agent 🤖

## Automatically debug failing tests in CI

### What is this?

This is a Dagger function that automatically debugs failing tests in CI.
In the dagger module under [.dagger](./.dagger) directory, there is a function called `debug-tests`.

The `debug-tests` function:
- Creates a [Workspace](./.dagger/workspace) for an LLM to read and write the files in the project and run tests
- Passes in the appropriate source and checker function to the workspace
- Give the LLM a prompt to debug the broken tests
- Get back a unified diff of the test fixes

To get a useful agentic flow out of this function, there's another function called `debug-broken-tests-pr` that:
- Uses the GitHub API to get the PR number and the branch name
- Uses the `debug-tests` function to debug the broken tests
- Uses the GitHub API to comment on the PR with suggestions of the fixes

### How do I try it?
Start a dev Dagger Engine with LLM support using:
https://docs.dagger.io/ai-agents#initial-setup

$ Fork or clone this repository and checkout the broken-tests branch:
```
git clone https://github.com/kpenfound/greetings-api
cd greetings-api
git checkout broken-tests
```

$ Get in a Dagger shell:
```
dagger
```

⋈ Run test function to see the failed tests:
```
test
```

⋈ Run debug-tests to let the agent fix the tests and tell you the fix.
```
debug-tests --model <any model, e.g. "gpt-4o">
```
