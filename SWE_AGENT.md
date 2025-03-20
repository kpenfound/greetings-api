# SWE Agent 🤖

The SWE Agent is an automated agent that can write new features for the project.

## Overview

First, I create a GitHub issue describing the work I want the agent to complete.

When the GitHub issue is labeled with `develop`, the agent will automatically run,
producing a pull request with the completed work.

Check out the full demo:

[![A Simple SWE Agent with Dagger](https://img.youtube.com/vi/B7P04M9c1m0/0.jpg)](https://www.youtube.com/watch?v=B7P04M9c1m0)

## Implementation

This is a [Dagger](https://dagger.io) function that automatically writes new features for the project.
Using Dagger to solve this is perfect because the agent can use the same code that developers and CI systems already use to test the code.

In the dagger module under [.dagger](./.dagger) directory, there is a new function called `Develop`.

The `develop` function:
- Creates a [Workspace](./.dagger/workspace) for an LLM to read and write the files in the project and run tests
- Passes in the appropriate source and checker function to the workspace
- Give the LLM a prompt to complete a feature assignment
- Get back a directory with the completed work

To get a useful agentic flow out of this function, there's another function called `DevelopPullRequest` that:
- Uses the GitHub API to get the assignment issue body
- Uses the `Develop` function to complete the assignment
- Uses the GitHub API to create a pull request with the completed work

## How do I try it?
The only dependency to run this agent is Dagger. Here are the [installation instructions](https://docs.dagger.io/ai-agents#initial-setup).

Once you have Dagger, fork or clone this repository:
```
git clone https://github.com/kpenfound/greetings-api
cd greetings-api
```

Then, get in a Dagger shell to interact with the module:
```
dagger
```

⋈ Run agent to complete the asssignment:
```
develop "Add a new greeting in Portuguese" | terminal
```

⋈ Run develop to let the agent complete the assignment with different models.
```
develop "Add a new greeting in Portuguese" --model <any model, e.g. "gpt-4o"> | terminal
```
