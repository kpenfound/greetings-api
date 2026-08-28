# Contributing to Greetings API

Thank you for your interest in contributing to the Greetings API! This document provides guidelines and information for contributors.

## About the Project

The Greetings API is a simple greeting service with a beautiful frontend. It serves greetings in multiple languages through a REST API and provides a user-friendly web interface. The project is built with Go for the backend and TypeScript for the frontend, and uses Dagger for CI/CD automation.

## Getting Started

### Fork and Clone

1. **Fork the repository** on GitHub by clicking the "Fork" button at the top right of the repository page.

2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/greetings-api.git
   cd greetings-api
   ```

3. **Add the upstream remote** to keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/kpenfound/greetings-api.git
   ```

4. **Keep your fork updated** by regularly pulling from upstream:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

### Prerequisites

- Go 1.18 or higher
- Node.js (for the frontend)
- [Dagger](https://dagger.io/) for running CI/CD operations. This project targets the v1 beta; run the CLI with `DAGGER_X_RELEASE=v1.0.0-beta.11` (or `dagger --x-release=v1.0.0-beta.11 ...`) so the CLI and engine match the version CI uses

## Project Architecture

The project follows a monorepo structure with both backend and frontend components:

```
greetings-api/
├── main.go              # Go backend server
├── main_test.go         # Go backend unit tests
├── e2e_test.go          # Go backend e2e tests (need a running API, see Running Tests)
├── greetings.json       # Greeting data in multiple languages
├── go.mod               # Go module dependencies
├── CONTRIBUTING.md      # Developer documentation
├── docs/                # Product documentation
│   ├── index.mdx       # Main docs file
├── website/             # Frontend application
│   ├── index.html      # Main HTML file
│   ├── package.json    # Frontend dependencies
│   ├── playwright.config.ts  # E2E test configuration
│   └── tests/          # Playwright E2E tests
├── .dagger/             # Dagger modules
│   ├── backend/        # Backend build module
│   ├── frontend/       # Frontend build module
│   ├── workspace/      # Agent workspace module
│   └── modules/greetings/  # Entrypoint module configuration
├── dagger.toml          # Dagger workspace configuration
└── dagger.lock          # Dagger dependency lock file
```

### Backend Architecture

- **Language**: Go
- **Framework**: Gorilla Mux for routing, CORS middleware
- **Structure**: Simple REST API with two endpoints:
  - `GET /` - Returns a random greeting
  - `GET /{language}` - Returns a greeting in the specified language
- **Data**: Greetings are stored in `greetings.json` and embedded in the binary
- **Testing**: Uses `gotest.tools`. `main_test.go` holds unit tests; `e2e_test.go` holds end-to-end tests that hit a running API over HTTP (endpoints, error responses, CORS) and skip unless `GREETINGS_API_URL` points at one

### Frontend Architecture

- **Language**: TypeScript
- **Testing**: Playwright for end-to-end tests
- **Linting**: ESLint with TypeScript support
- **Build**: Managed through Dagger modules

### CI/CD Architecture

- **Tool**: Dagger for CI/CD operations
- **Modules**: Project modules for backend, frontend, and agent workspace management, plus reusable modules installed in `dagger.toml`: [go](https://github.com/dagger/go) (Go lint/test), [eslint](https://github.com/dagger/eslint) (JS/TS lint), and [playwright](https://github.com/dagger/playwright) (E2E tests)
- **Wiring**: Reusable modules get project services through settings in `dagger.toml` rather than custom check functions. The go module's `base` is `backend:go-test-base`, a Go container with `backend:serve` bound as `GREETINGS_API_URL`, so `go:test-all` runs the e2e tests against the real API. The playwright module's `service` is `frontend:serve`, so `playwright:test` runs the browser tests against the served site
- **Checks**: All validation runs through `dagger check`; services run through `dagger up`

## Development Workflow

### Running the Application

**Using Dagger (Recommended):**
```bash
# Serve both backend and frontend
dagger up

# Or run from remote without cloning
dagger -W github.com/kpenfound/greetings-api up
```

The frontend will be available at http://localhost:8081/ and the backend at http://localhost:8080/

### Running Tests

**Backend Tests:**
```bash
# Using Dagger (recommended)
dagger check go:test-all

# Or directly with Go
go test ./...
```

`go:test-all` gets its API from `backend:go-test-base`, wired as the go module's `base` setting in `dagger.toml`, so the e2e tests in `e2e_test.go` run against a real server.

> A bare `go test ./...` runs only the unit tests: the e2e tests skip when `GREETINGS_API_URL` is unset, and a skipped test reports the same as a passing one. To run them outside Dagger, start the API (`go run .`) and set `GREETINGS_API_URL=http://localhost:8080`.

**Frontend E2E Tests:**
```bash
# Using Dagger (recommended)
dagger check playwright:test

# Or directly with npm
cd website
npm run test:e2e
```

### Running Lints

**Backend Linting:**
```bash
# Using Dagger
dagger check go:lint-all
```

**Frontend Linting:**
```bash
# Using Dagger
dagger check eslint:lint

# Or directly with npm
cd website
npm run lint
```

### Available Dagger Commands

- `dagger check` - Run the complete CI checks
- `dagger check -l` - List all available checks
- `dagger up` - Serve the application locally (backend :8080, frontend :8081)
- `dagger up -l` - List all available services
- `dagger api call build` - Build the backend and frontend
- `dagger api call release` - Create a GitHub release
- `dagger api call --help` - List all available functions

## Making Changes

### Code Style

- **Go**: Follow standard Go formatting (`go fmt`)
- **TypeScript**: Follow the ESLint configuration in the project
- **Commits**: Use clear, descriptive commit messages

### Documentation

- **Developer Docs**: Update CONTRIBUTING.md with any architectural changes
- **Product Docs**: Update docs/ with relevant product changes

### Testing Requirements

- All new Go code should include unit tests
- Frontend changes should not break existing E2E tests
- Run the full test suite before submitting PRs: `dagger check`

### Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly:
   ```bash
   dagger check
   ```

4. **Commit your changes** with clear commit messages

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference to any related issues
   - Screenshots if UI changes are involved

## Getting Help

If you need help or have questions:

- Check the existing [issues](https://github.com/kpenfound/greetings-api/issues)
- Look at the [demos](./README.md#demos) for examples
- Review the [README](./README.md) for basic usage

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to the Greetings API! 🎉
