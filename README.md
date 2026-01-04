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
```

The development server will start and serve the frontend application.

## Frontend Features

### React and Redux Toolkit

The frontend is a React application written in TypeScript and powered by Redux Toolkit. Global state is managed through slices and accessed using typed hooks for dispatching actions and selecting state.

### Responsive Layout

The application includes a responsive layout that adapts to different viewport sizes:

* A responsive navigation bar with links to the home page, authentication page, and an external test link
* A responsive footer with an automatically updating copyright notice

### Alert System

The alert system provides a centralized way to display feedback to the user. Alerts support different severity levels, positioning, and dismissal behavior. This system is intended for things like API errors, form validation messages, and success confirmations.

Alerts are controlled through Redux, which allows them to be triggered from anywhere in the application.

Example usage:

```typescript
import { useAppDispatch } from "../../app/store/hooks";
import { openAlert } from "../../shared/alert/alertSlice";

const Component = () => {
  const dispatch = useAppDispatch();

  const handleOpenAlert = () => {
    dispatch(
      openAlert({
        open: true,
        closeable: true,
        severity: "error",
        message: "Please fix the errors in the form",
        anchor: { x: "right", y: "bottom" },
      })
    );
  };

  return (
    <button
      onClick={handleOpenAlert}
      className="border-2 bg-primary border-primary text-white p-2 rounded hover:bg-neutral hover:text-primary transition-all cursor-pointer"
    >
      Open alert
    </button>
  );
};
```

### Modal and Drawer System

The project includes a scalable modal and drawer system built on top of Redux. This allows global control over modals and drawers without tightly coupling them to specific components.

* Generic modals such as confirmation dialogs live in the shared modal directory
* Feature-specific modals are defined inside their respective feature slices
* All modals are registered in a central modal registry

Drawers work similarly and are commonly used for mobile navigation or contextual menus.

Example of opening a drawer from the navigation bar:

```typescript
import { useAppDispatch } from "../../app/store/hooks";
import { openDrawer } from "../drawer/drawerSlice";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(
      openDrawer({
        open: true,
        drawerContent: "navbar",
        anchor: "right",
        title: "Menu",
      })
    );
  };

  return (
    <button onClick={handleClick} className="lg:hidden" aria-label="Open menu">
      Open menu
    </button>
  );
};
```

### Authentication Flow

The frontend includes a complete authentication flow that integrates with the backend. This covers:

* User login
* Account creation
* Authenticated state management
* Conditional rendering based on authentication status

Auth state is managed globally and can be accessed by any feature that requires it.

### Page Transitions

A page transition framework is included to provide smooth animated transitions between routes. This improves perceived performance and creates a more polished user experience.

### RTK Query API Layer

The API layer is fully abstracted using RTK Query. Each feature owns its own API definitions while sharing a common base API configuration. This setup provides:

* Automatic caching
* Request deduplication
* Built-in loading and error states
* Easy invalidation and refetching

This approach keeps data fetching consistent and predictable across the application.

## CLI Overview

The project includes a custom interactive CLI designed to automate common frontend and backend scaffolding tasks. The CLI is intended to reduce repetitive setup work while still leaving full control in the developer’s hands.

The CLI currently exposes two main modules:

* Pages management for frontend routing and navigation
* Features management for backend and frontend data scaffolding

The CLI is menu-driven and can be extended over time as the project grows.

## CLI Architecture

The CLI is structured around a central run loop that keeps the process alive until the user explicitly exits. Each domain is isolated into its own module with a dedicated menu and action handlers.

At a high level:

* A main menu allows users to choose what domain to manage
* Each domain exposes its own sub-menu
* Actions are executed synchronously with clear feedback
* Errors are caught and surfaced without crashing the CLI

This design allows users to move freely between Pages and Features without restarting the CLI.

## Pages Module

The Pages module manages frontend pages and routing. It automates the creation and removal of route-level React components while keeping application routing and navigation in sync.

### Adding a Page

When adding a page, the CLI prompts for:

* A page name in PascalCase
* A route path that starts with a slash
* Whether the page should appear in the navigation bar

Based on this input, the CLI:

* Creates a new page folder under the pages directory
* Generates a page component using a shared template
* Registers the route in App.tsx
* Optionally adds navigation links to the navbar and mobile drawer

This ensures routing, navigation, and file structure remain consistent.

### Deleting a Page

When deleting a page, the CLI:

* Removes the page folder and component files
* Removes the route definition from App.tsx
* Removes matching links from both the navbar and navbar drawer

Route paths are detected automatically to avoid accidental removal of unrelated links.

## Features Module

The Features module is responsible for scaffolding backend features and their corresponding frontend API layers. Features represent domain entities backed by MongoDB collections.

Feature generation is intended to accelerate development, not replace custom API logic. Generated code serves as a strong starting point that developers can tailor to their specific needs.

### Feature Naming Rules

To keep the codebase consistent, the CLI enforces strict naming rules:

* Feature names must be PascalCase
* Feature names must be singular

The CLI validates names interactively and prevents plural feature creation.

### Defining Feature Schemas

When creating a feature, users can define the schema in one of two ways:

* Interactive step-by-step prompts
* Direct JSON input

Supported field options include:

* Field type selection
* Required and optional fields
* Unique constraints
* Enum values for string fields
* Default values
* ObjectId references to other models

Timestamps can also be added automatically.

### Generated Backend Files

For each feature, the CLI generates:

* A Mongoose model defining the schema
* A feature route file wired into the base CRUD layer
* Automatic registration of the route in the server entry file

This allows the feature to immediately expose full CRUD endpoints without manual wiring.

### Generated Frontend Files

On the frontend, the CLI generates:

* TypeScript type definitions matching the feature schema
* An RTK Query API service for interacting with the backend feature
* Automatic registration of the API slice in the shared base API

This keeps frontend and backend data contracts aligned.

## CLI Philosophy

The CLI is intentionally conservative in scope. It focuses on scaffolding structure and wiring rather than hiding complexity. Developers are expected to customize generated code to meet application-specific requirements.

This approach balances productivity with flexibility while preserving clarity in the codebase.

## Summary

This project combines a scalable frontend, a feature-driven backend, and a purpose-built CLI into a cohesive full-stack foundation. The CLI reduces setup overhead, the backend minimizes repeated boilerplate, and the frontend enforces predictable structure.

Together, these pieces form a starter that is designed to grow alongside real-world applications rather than being outgrown early in development.
