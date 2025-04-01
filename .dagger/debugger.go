package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/kpenfound/greetings-api/.dagger/internal/dagger"
)

// Debug broken tests. Returns a unified diff of the test fixes
func (g *Greetings) DebugTests(
	ctx context.Context,
	// The model to use to debug debug tests
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) (string, error) {
	prompt := dag.CurrentModule().Source().File("prompts/fix_tests.md")

	// Check if backend is broken
	if _, berr := g.Backend.CheckDirectory(ctx, g.Backend.Source()); berr != nil {
		ws := dag.Workspace(
			g.Backend.Source(),
			g.Backend.AsWorkspaceCheckable(),
		)
		env := dag.Env().
			WithWorkspaceInput("workspace", ws, "workspace to read, write, and test code").
			WithWorkspaceOutput("fixed", "workspace with fixed tests")
		return dag.LLM(dagger.LLMOpts{Model: model}).
			WithEnv(env).
			WithPromptFile(prompt).
			Env().
			Output("fixed").
			AsWorkspace().
			Diff(ctx)
	}

	// Check if frontend is broken
	if _, ferr := g.Frontend.CheckDirectory(ctx, g.Frontend.Source()); ferr != nil {
		ws := dag.Workspace(
			g.Frontend.Source(),
			g.Frontend.AsWorkspaceCheckable(),
		)
		env := dag.Env().
			WithWorkspaceInput("workspace", ws, "workspace to read, write, and test code").
			WithWorkspaceOutput("fixed", "workspace with fixed tests")
		return dag.LLM(dagger.LLMOpts{Model: model}).
			WithEnv(env).
			WithPromptFile(prompt).
			Env().
			Output("fixed").
			AsWorkspace().
			Diff(ctx)
	}

	return "", fmt.Errorf("no broken tests found")
}

// Debug broken tests on a pull request and comment fix suggestions
func (g *Greetings) DebugBrokenTestsPr(
	ctx context.Context,
	// Github token with permissions to comment on the pull request
	githubToken *dagger.Secret,
	// Git commit in Github
	commit string,
	// The model to use to debug debug tests
	// +optional
	// +default = "gemini-2.0-flash"
	model string,
) error {
	// Determine PR head
	gitRef := dag.Git(g.Repo).Commit(commit)
	gitSource := gitRef.Tree()
	pr, err := dag.GithubIssue(githubToken).GetPrForCommit(ctx, g.Repo, commit)
	if err != nil {
		return err
	}

	// Set source to PR head
	g = New(gitSource, g.Repo, g.Image, g.App)

	// Suggest fix
	suggestionDiff, err := g.DebugTests(ctx, model)
	if err != nil {
		return err
	}
	if suggestionDiff == "" {
		return fmt.Errorf("no suggestions found")
	}

	// Convert the diff to CodeSuggestions
	codeSuggestions := parseDiff(suggestionDiff)

	// For each suggestion, comment on PR
	for _, suggestion := range codeSuggestions {
		markupSuggestion := "```suggestion\n" + strings.Join(suggestion.Suggestion, "\n") + "\n```"
		err := dag.GithubIssue(githubToken).WritePullRequestCodeComment(
			ctx,
			g.Repo,
			pr,
			commit,
			markupSuggestion,
			suggestion.File,
			"RIGHT",
			suggestion.Line)
		if err != nil {
			return err
		}
	}
	return nil
}
