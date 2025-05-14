package main

import (
	"context"
	"fmt"
	"strings"

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
		WithWorkspaceOutput("completed", "workspace with developed solution")
	agent := dag.LLM(dagger.LLMOpts{Model: model}).
		WithEnv(env).
		WithPromptFile(prompt).
		Loop()
	totalTokens, err := agent.TokenUsage().TotalTokens(ctx)
	if err == nil {
		fmt.Printf("Total token usage: %d\n", totalTokens)
	}
	work := agent.Env().
		Output("completed").
		AsWorkspace()

	return work.Work()
}

// Develop changes based on a Github issue and open a pull request
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
	title = strings.TrimSpace(title)

	// Open the pull request
	pr := gh.CreatePullRequest(g.Repo, title, body, work)
	return pr.URL(ctx)
}

// Agent to develop changes based on feedback on changes made in a Directory
func (g *Greetings) DevelopFeedback(
	ctx context.Context,
	// Source directory containing the developed changes
	source *dagger.Directory,
	// Original assignment being developed
	assignment string,
	// Diff of the changes done so far
	diff string,
	// Feedback given to the changes done so far
	feedback string,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) (*dagger.Directory, error) {
	// Run the agent
	prompt := dag.CurrentModule().Source().File("prompts/feedback.md")

	ws := dag.Workspace(
		source,
		// FIXME: no great way to determine which checker without submodule or self calls
		g.Backend.AsWorkspaceCheckable(),
	)

	env := dag.Env().
		WithWorkspaceInput("workspace", ws, "workspace to read, write, and test code").
		WithStringInput("description", assignment, "the description of the pull request").
		WithStringInput("feedback", feedback, "the feedback on the pull request").
		WithStringInput("diff", diff, "the git diff of the pull request code changes so far").
		WithWorkspaceOutput("completed", "workspace result with the feedback implemented")
	agent := dag.LLM(dagger.LLMOpts{Model: model}).
		WithEnv(env).
		WithPromptFile(prompt).
		Loop()
	completed := agent.Env().
		Output("completed").
		AsWorkspace().
		Work()
	return completed, nil
}

// Receive feedback on an open pull request via slash command
func (g *Greetings) PullRequestFeedback(
	ctx context.Context,
	// Github token with permissions to create a pull request
	githubToken *dagger.Secret,
	// The github issue to complete
	issueId int,
	// The feedback recieved on the pull request
	feedback string,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) error {
	// Strip out slash command
	feedback = strings.ReplaceAll(feedback, "/agent ", "")

	// Get the pull request information
	gh := dag.GithubIssue(dagger.GithubIssueOpts{Token: githubToken})
	issue := gh.Read(g.Repo, issueId)
	description, err := issue.Body(ctx)
	if err != nil {
		return err
	}

	headRef, err := issue.HeadRef(ctx)
	if err != nil {
		return err
	}

	diffURL, err := issue.DiffURL(ctx)
	if err != nil {
		return err
	}
	diff, err := dag.HTTP(diffURL).Contents(ctx)
	if err != nil {
		return err
	}

	// Get the source trees
	head := dag.Git(g.Repo).Ref(headRef).Tree()

	// Run the agent
	completed, err := g.DevelopFeedback(ctx, head, description, diff, feedback, model)
	if err != nil {
		return err
	}
	// Push the changes
	return gh.CreatePullRequestCommit(ctx, g.Repo, completed, headRef)
}
