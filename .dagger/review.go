package main

import (
	"context"

	"github.com/kpenfound/greetings-api/.dagger/internal/dagger"
)

// Agent to review changes made in a Directory
func (g *Greetings) DevelopReview(
	ctx context.Context,
	// Base directory to compare without the developed changes
	base *dagger.Directory,
	// Source directory containing the developed changes
	source *dagger.Directory,
	// Original assignment being developed
	assignment string,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) (string, error) {
	// Get the diff between the trees
	diff, err := dag.Container().
		From("alpine/git").
		WithWorkdir("/app").
		WithDirectory("/app", base).
		WithDirectory("/app", source.WithoutDirectory(".git")).
		WithExec([]string{"git", "diff"}).
		Stdout(ctx)
	if err != nil {
		return "", err
	}

	// Run the agent
	prompt := dag.CurrentModule().Source().File("prompts/review.md")

	ws := dag.Workspace(
		source,
		// FIXME: no great way to determine which checker without submodule or self calls
		g.Backend.AsWorkspaceCheckable(),
	)

	env := dag.Env().
		WithWorkspaceInput("workspace", ws, "workspace to read, write, and test code").
		WithStringInput("description", assignment, "the description of the pull request").
		WithStringInput("diff", diff, "the git diff of the pull request code changes so far").
		WithStringOutput("review", "the resulting review of the pull request")
	agent := dag.LLM(dagger.LLMOpts{Model: model}).
		WithEnv(env).
		WithPromptFile(prompt).
		Loop()

	return agent.Env().Output("review").AsString(ctx)
}

// Review an open pull request via slash command
func (g *Greetings) PullRequestReview(
	ctx context.Context,
	// Github token with permissions to create a pull request
	githubToken *dagger.Secret,
	// The github issue to complete
	issueId int,
	// The model to use to complete the assignment
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) error {
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

	baseRef, err := issue.BaseRef(ctx)
	if err != nil {
		return err
	}

	// Get the source trees
	head := dag.Git(g.Repo).Ref(headRef).Tree()
	base := dag.Git(g.Repo).Ref(baseRef).Tree()

	// Run the agent
	review, err := g.DevelopReview(ctx, base, head, description, model)
	if err != nil {
		return err
	}
	// Write the review
	return gh.WriteComment(ctx, g.Repo, issueId, review)
}
