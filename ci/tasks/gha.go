package tasks

import (
	"context"
	"os"
)

func Gha(ctx context.Context) error {
	ev := getEvent()

	if ev.event == "pull_request" && ev.base_ref == "main" {
		if ev.repository_owner != ev.actor {
			// Disable secrets?
		}

		return Ci(ctx)
	}

	if ev.event == "push" && ev.base_ref == "main" {
		// return Cd(ctx)
	}

	return nil
}

type GithubEvent struct {
	event            string
	ref              string
	ref_type         string
	repository       string
	repository_owner string
	actor            string
	base_ref         string
	head_ref         string
	git_sha          string
}

func getEvent() GithubEvent {
	// Check we're in GITHUB_ACTIONS
	if os.Getenv("GITHUB_ACTIONS") != "true" {
		return GithubEvent{}
	}

	return GithubEvent{
		event:            os.Getenv("GITHUB_EVENT_NAME"),
		ref:              os.Getenv("GITHUB_REF"),
		ref_type:         os.Getenv("GITHUB_REF_TYPE"),
		repository:       os.Getenv("GITHUB_REPOSITORY"),
		repository_owner: os.Getenv("GITHUB_REPOSITORY_OWNER"),
		actor:            os.Getenv("GITHUB_ACTOR"),
		base_ref:         os.Getenv("GITHUB_BASE_REF"),
		head_ref:         os.Getenv("GITHUB_HEAD_REF"),
		git_sha:          os.Getenv("GITHUB_SHA"),
	}
}
