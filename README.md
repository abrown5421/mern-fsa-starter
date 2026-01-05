# MERN FSA Starter

A modern MERN frontend starter built with React, Redux Toolkit, TypeScript, and Feature-Sliced Architecture. This project lives inside a pnpm monorepo and is designed to scale cleanly from small applications to large production systems while maintaining predictable structure and clear ownership of code.

This documentation covers the frontend only. Backend and CLI documentation will be added separately.

## Project Structure

The frontend application is located at:

```
apps/web
```

All frontend source code lives inside the `src` directory. The project follows Feature-Sliced Architecture, which organizes code by business responsibility rather than by technical type.

At a high level, the structure includes:

* `app` for global application setup such as the Redux store, base providers, and routing
* `pages` for route-level components
* `features` for business logic and user interactions
* `entities` for reusable domain models
* `shared` for reusable UI components, utilities, and configuration

This structure encourages strong boundaries, improves discoverability, and keeps features isolated from one another.

## Installation

Use the following commands to clone and run the project locally using pnpm:

```bash
degit abrown5421/mern-fsa-starter my-project
cd my-project
pnpm install
pnpm dev
#IMPORTANT: If you'd like to use the CLI, I recommend linking it globally like so:
cd apps\cli
pnpm build
pnpm link --global
```

The development server will start and serve the frontend application.
