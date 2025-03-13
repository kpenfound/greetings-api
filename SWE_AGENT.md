# SWE Agent 🤖

## Automatically build new features

### What is this?

This is a Dagger function that automatically writes new features for the project.
In the dagger module under [.dagger](./.dagger) directory, there is a function called `Develop`.

The `develop` function:
- Creates a [Workspace](./.dagger/workspace) for an LLM to read and write the files in the project and run tests
- Passes in the appropriate source and checker function to the workspace
- Give the LLM a prompt to complete a feature assignment
- Get back a directory with the completed work

To get a useful agentic flow out of this function, there's another function called `DevelopPullRequest` that:
- Uses the GitHub API to get the assignment issue body
- Uses the `Develop` function to complete the assignment
- Uses the GitHub API to create a pull request with the completed work

Check out the full demo below:
TODO

### How do I try it?
Start a dev Dagger Engine with LLM support using:
https://docs.dagger.io/ai-agents#initial-setup

$ Fork or clone this repository and checkout the broken-tests branch:
```
git clone https://github.com/kpenfound/greetings-api
cd greetings-api
```

$ Get in a Dagger shell:
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
