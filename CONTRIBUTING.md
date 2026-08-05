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
- [Dagger](https://dagger.io/) for running CI/CD operations

## Project Architecture

The project follows a monorepo structure with both backend and frontend components:

```
greetings-api/
├── main.go              # Go backend server
├── main_test.go         # Go backend tests
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
- **Testing**: Uses `gotest.tools` for unit tests

### Frontend Architecture

- **Language**: TypeScript
- **Testing**: Playwright for end-to-end tests
- **Linting**: ESLint with TypeScript support
- **Build**: Managed through Dagger modules

### CI/CD Architecture

- **Tool**: Dagger for CI/CD operations
- **Modules**: Project modules for backend, frontend, and agent workspace management, plus reusable modules installed in `dagger.toml`: [go](https://github.com/dagger/go) (Go lint/test), [eslint](https://github.com/dagger/eslint) (JS/TS lint), and [playwright](https://github.com/dagger/playwright) (E2E tests, wired to `frontend:serve`)
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
# Using Dagger
dagger check go:test-all

# Or directly with Go
go test ./...
```

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
- `dagger call build` - Build the backend and frontend
- `dagger call release` - Create a GitHub release
- `dagger functions` - List all available functions

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
