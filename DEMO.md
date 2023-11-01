# Dagger Demo Flow

## The Greetings API App

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

`dagger -m ./ci call unit-test --dir "."`

### Build

Build the project

`dagger -m ./ci call build --dir "."`

### Serve

Run and serve the project

`dagger -m ./ci up -p 8080,8081 serve --dir "."`

This serves the backend at `localhost:8080` and the frontend at `localhost:8081`. Once the
ports are tunneled, open `localhost:8081` in a browser

### Deploy

Deploy the project

`dagger -m ./ci call deploy --dir "." --fly-token $FLY_TOKEN --netlify-token $NETLIFY_TOKEN`

This deploys the backend to fly.io at https://dagger-demo.fly.dev/ and the frontend to
Netlify at https://dagger-demo.netlify.app/
