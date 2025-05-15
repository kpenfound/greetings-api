// A generated module for Workspace functions

package main

import (
	"context"
	"dagger/workspace/internal/dagger"
)

// Interface for something that can be checked
type Checkable interface {
	dagger.DaggerObject
	CheckDirectory(ctx context.Context, source *dagger.Directory) (string, error)
	FormatFile(source *dagger.Directory, path string) *dagger.Directory
}

// Place to do work and check it
type Workspace struct {
	Work *dagger.Directory
	// +private
	Start *dagger.Directory
	// +private
	Checker Checkable
}

func New(
	// Initial state of the workspace
	source *dagger.Directory,
	// Checker to use for testing
	checker Checkable,
) *Workspace {
	return &Workspace{
		Start:   source,
		Work:    source,
		Checker: checker,
	}
}

// Read the contents of a file in the workspace at the given path
func (w *Workspace) Read(
	ctx context.Context,
	// Path to read the file at
	path string,
) (string, error) {
	return w.Work.File(path).Contents(ctx)
}

// Write the contents of a file in the workspace at the given path
func (w *Workspace) Write(
	ctx context.Context,
	// Path to write the file to
	path string,
	// Contents to write to the file
	contents string,
) *Workspace {
	// Write new file
	w.Work = w.Work.WithNewFile(path, contents)
	// Apply formatting
	w.Work = w.Checker.FormatFile(w.Work, path)
	return w
}

// Reset the workspace to the original state
func (w *Workspace) Reset() *Workspace {
	w.Work = w.Start
	return w
}

// List the files in the workspace in tree format
func (w *Workspace) Tree(ctx context.Context) (string, error) {
	return dag.Container().From("alpine:3").
		WithDirectory("/workspace", w.Work).
		WithExec([]string{"tree", "/workspace"}).
		Stdout(ctx)
}

// Run the tests in the workspace
func (w *Workspace) Check(ctx context.Context) (string, error) {
	return w.Checker.CheckDirectory(ctx, w.Work)
}

// Show the changes made to the workspace so far in unified diff format
func (w *Workspace) Diff(ctx context.Context) (string, error) {
	return dag.Container().From("alpine:3").
		WithDirectory("/a", w.Start).
		WithDirectory("/b", w.Work).
		WithExec([]string{"diff", "-rN", "a/", "b/"}, dagger.ContainerWithExecOpts{Expect: dagger.ReturnTypeAny}).
		Stdout(ctx)
}
