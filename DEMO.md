# Dagger Demo Flow

## The Greetings API App

Familiarize yourself with the greetings-api project

### Backend

Lives at the repo root

Simple API written in Go which listens on http 8080 and returns a greeting message.

`/main.go`

The API endpoint and it's configuration. This contains the message that the API returns

`/main_test.go`

The unit test for the greeting function. It tests that the greeting is what it expects. If
the greeting is changed, it should be changed here too or the test will fail. This is an
easy way to demonstrate test failures.

### Frontend

Lives under `/website/`

Static site using Hugo, a static site generator written in Go.

`website/partials/shortcodes/greeting.html`

The partial included in the website which makes a call to the backend API

`content/_index.md`

The front page of the app which includes the greetings-api message

`website/content/posts/my-first-post.md`

Sample post which includes the greetings-api message


## The CI

Lives under `/ci/`

The CI module has two main submodules: backend and frontend. Those are subdirectories of
`./ci` and focus on the specifics of the backend/frontend. The ci module itself pulls
those together for a single project entrypoint.

### Test

Run the unit tests for the project

`dagger call -m ./ci test --dir "."`

### Build

Build the project

`dagger download -m ./ci build --dir "." --env dev`

### Serve

Run and serve the project

`dagger up -m ./ci -p 8080,8081 serve --dir "."`

This serves the backend at `localhost:8080` and the frontend at `localhost:8081`. Once the
ports are tunneled, open `localhost:8081` in a browser

### Deploy

Deploy the project

`dagger call -m ./ci deploy --dir "." --fly-token $FLY_TOKEN --netlify-token $NETLIFY_TOKEN`

This deploys the backend to fly.io at https://dagger-demo.fly.dev/ and the frontend to
Netlify at https://dagger-demo.netlify.app/

Secrets are retrieved at runtime from Infisical, a SaaS Secret Manager

### Release

Create a release of the project

`dagger call -m ./ci ci --dir . --release --infisical-token $TOKEN`

### CI without cloning the project/branch

Run the CI without even checking out a branch

`dagger call -m ./ci ci-remote --commit $COMMIT_SHA`

## Demo

Install Dagger CLI 0.9.3 or above

Recording [on Drive](https://drive.google.com/file/d/1mWthDw6lFa_Z-WQgPvyinVodtn9ELl-d/view?usp=sharing)

- Lead with [Daggerverse](https://daggerverse.dev)
	- browse to Hugo module 🎥 0:52
	- run module against `./frontend`: `dagger download -m github.com/jedevc/daggerverse/hugo build --target ./ci/frontend`
- Now pull together multiple modules in `./ci`. This ci uses: 🎥 3:02
    - hugo module in `ci/frontend/main.go`
    - golang module in `ci/frontend/main.go` and `ci/backend/main.go` 🎥 4:20
    - proxy module in `ci/main.go` <- written in python!
    - netlify module in `ci/main.go` <- written in python!
    - fly module in `ci/main.go` <- written in python!
    - github releases in `ci/main.go`
    - infisical in `ci/main.go` <- written in python!
- Show in code:
    - running in containers
    - declarative environments
    - secrets!
    - services
- Local runs 🎥 6:12
    - `dagger functions -m ./ci`
    - `dagger serve ./ci serve --help`
    - `dagger serve -m ./ci -p 8080,8081 serve --dir "."`
    - `curl localhost:8080` to show the result from the backend API
    - navigate to [localhost:8081](http://localhost:8081/) in browser
    - notice "Hello Kubecon!" greeting coming from backend API 🎥 8:12
- CI
	- push a commit
    - show `.circleci/config.yml` 🎥 9:17
    - show `.github/workflows/test.yml`
	- see run in Github Actions 🎥 10:00
- Cloud 🎥 10:25
	- look at all runs
	- look at [a run](https://dagger.cloud/runs/7b77ca7f-c408-4a9b-a493-8637986b0597)
	- errors? debugging?
	- caching

