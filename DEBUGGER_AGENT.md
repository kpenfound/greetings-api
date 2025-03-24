# Debugger Agent 🤖

An AI Agent that automatically resolves failing tests in CI

## Overview

This is an agent that automatically debugs failing tests in CI. The fix for the failing test is added as a suggestion on a failing PR that can be accepted with a single click.

Check out the full demo below:
[![Watch the video](https://img.youtube.com/vi/VHUi9ABdASA/maxresdefault.jpg)](https://www.youtube.com/watch?v=VHUi9ABdASA)

## Implementation

The agent is a [Dagger](https://dagger.io) function that automatically debugs failing tests in CI.

In the dagger module under [.dagger](./.dagger) directory, there is a new function called `debug-tests`.

The `debug-tests` function:
- Creates a [Workspace](./.dagger/workspace) for an LLM to read and write the files in the project and run tests
- Passes in the appropriate source and checker function to the workspace
- Give the LLM a prompt to debug the broken tests
- Get back a unified diff of the test fixes

To get a useful agentic flow out of this function, there's another function called `debug-broken-tests-pr` that:
- Uses the GitHub API to get the PR number and the branch name
- Uses the `debug-tests` function to debug the broken tests
- Uses the GitHub API to comment on the PR with suggestions of the fixes

## How do I try it?

The only dependency to run this agent is Dagger. Here are the [installation instructions](https://docs.dagger.io/ai-agents#initial-setup).

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
