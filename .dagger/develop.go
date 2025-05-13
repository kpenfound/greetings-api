package main

import (
	"context"
	"fmt"

	"github.com/kpenfound/greetings-api/.dagger/internal/dagger"
)

// Complete an assignment for the greetings project and get back the completed work
func (g *Greetings) Develop(
	ctx context.Context,
	// The assignment to complete
	assignment string,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) *dagger.Directory {
	prompt := dag.CurrentModule().Source().File("prompts/assignment.md")

	ws := dag.Workspace(
		g.Source,
		// FIXME: no great way to determine which checker without submodule or self calls
		g.Backend.AsWorkspaceCheckable(),
	)

	env := dag.Env().
		WithWorkspaceInput("workspace", ws, "workspace to read, write, and test code").
		WithStringInput("assignment", assignment, "the assignment to complete").
		WithWorkspaceOutput("fixed", "workspace with developed solution")
	agent := dag.LLM(dagger.LLMOpts{Model: model}).
		WithEnv(env).
		WithPromptFile(prompt).
		Loop()
	totalTokens, err := agent.TokenUsage().TotalTokens(ctx)
	if err == nil {
		fmt.Printf("Total token usage: %d\n", totalTokens)
	}
	work := agent.Env().
		Output("fixed").
		AsWorkspace()

	return work.Work()
}

func (g *Greetings) DevelopPullRequest(
	ctx context.Context,
	// Github token with permissions to create a pull request
	githubToken *dagger.Secret,
	// The github issue to complete
	issueId int,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) (string, error) {
	gh := dag.GithubIssue(dagger.GithubIssueOpts{Token: githubToken})
	// Get the issue body
	issue := gh.Read(g.Repo, issueId)

	assignment, err := issue.Body(ctx)
	if err != nil {
		return "", err
	}

	// Pass the assignment to the develop function
	work := g.Develop(ctx, assignment, model)

	// Create a pull request with the feature branch
	body := fmt.Sprintf("%s\n\nCompleted by Agent\nFixes https://%s/issues/%d\n", assignment, g.Repo, issueId)
	title, err := dag.LLM(dagger.LLMOpts{Model: model}).
		WithPrompt("Write an appropriate pull request title for the following assignment. It should be under 150 characters. Just tell me the title and nothing else.\nAssignment:\n" + assignment).
		LastReply(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to come up with pull request title: %v", err)
	}

	// Open the pull request
	pr := gh.CreatePullRequest(g.Repo, title, body, work)
	return pr.URL(ctx)
}
