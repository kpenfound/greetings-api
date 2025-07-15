# Agentic CI

This project has a collection of agents that implement "agentic ci". These agents all work together to improve the software delivery lifecycle.

We have the following agents:

## Developer Agent

The [Develop](./.dagger/develop.go) agent that develops features. It can run locally or hands-free in Github when a maintainer comments `/develop` on an issue that should be solved. The agent will open a pull request with its solution.

When the agent opens a pull request, it will automatically request the review agent to review the code.

The agent is expected to write exhaustive tests, maintain product documentation, and maintain developer documentation.

## Reviewer Agent

The [Review](./.dagger/review.go) agent provides code reviews on pull requests. Its criteria are in the [prompt](./.dagger/prompts/review.md). The review is provided as a comment on a pull request.

If the owner of the pull request is the Develop agent, the review will automatically get passed to the feedback agent for the feedback to get implemented. If the feedback is something that the agent should keep in mind for all contributions, the agent will update its own prompts or developer documentation, depending on the feedback.

## Debugger Agent

The [Debug](./.dagger/debugger.go) can automatically fix broken lints and tests. When linting or testing fails on a pull request in CI, this agent automatically runs and comments the fix as a code suggestion. This allows the owner of the pull request to accept the changes if they are appropriate or implement their own fix otherwise.

## Feedback Agent

The [Feedback](./.dagger/develop.go) agent is a mechanism to provide feedback to the Develop agent and have it iterate on the solution. This is essentially the same as the Develop agent with a slightly different prompt so that the agent will consider the original assignment as well as the work completed so far and the feedback on the work.
