# React Template

A modern, scalable, and feature-rich React template built with TypeScript and Vite. This project provides a comprehensive foundation for building React applications with a clean architecture, authentication, routing, and state management.

---

## Project Structure

This project follows a feature-based architecture to ensure scalability and maintainability. All core business logic is organized by domain, making it easy to locate and work with related code.

```
/
├── .vscode/                  # VSCode editor settings
├── public/                   # Static assets that are publicly accessible and not processed by the build tool
│   └── vite.svg              # Example: favicon or logo
├── src/
│   ├── assets/               # Static assets that are imported into the app (e.g., images, fonts)
│   │   └── logo.svg
│   │
│   ├── components/           # Global, reusable, and purely presentational UI components
│   │   ├── layout/           # Components for structuring the visual layout of the application
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx  # Composes Header, Footer, Sidebar to create a consistent page layout
│   │   └── ui/               # Unstyled base components, typically from a library like shadcn/ui
│   │       ├── button.tsx    # A reusable button component
│   │       ├── dialog.tsx    # A modal/dialog component
│   │       ├── input.tsx     # A form input component
│   │       └── ...
│   │
│   ├── features/             # The core business logic and functionality of your app, organized by domain
│   │   ├── auth/             # Handles everything related to user authentication
│   │   │   ├── components/   # React components that are ONLY used within the auth feature
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── services/     # React Query hooks for API calls (e.g., `useLogin`, `useRegister`)
│   │   │   ├── store.ts      # Zustand store for managing auth state (e.g., current user, token)
│   │   │   ├── types.ts      # TypeScript types specific to authentication (e.g., `User`, `LoginPayload`)
│   │   │   └── schemas.ts    # Zod schemas for validating authentication forms
│   │   │
│   │   ├── appointments/     # Example feature: Handles appointment-related functionality
│   │   │   ├── components/   # Components specific to appointments
│   │   │   ├── services/     # React Query hooks for appointment APIs
│   │   │   ├── hooks/        # Custom hooks for complex logic within this feature
│   │   │   ├── types.ts      # TypeScript types for appointments
│   │   │   └── schemas.ts    # Zod schemas for validating appointment data
│   │   │
│   │   └── ...               # Add your own features following this same pattern
│   │
│   ├── hooks/                # Global, reusable hooks that can be used across multiple features
│   │   ├── useTheme.tsx
│   │   └── useMediaQuery.tsx
│   │
│   ├── lib/                  # Utility functions and external library configurations
│   │   ├── api.ts            # A pre-configured client (e.g., Axios instance) for making API requests
│   │   └── utils.ts          # Truly generic helper functions (like shadcn's `cn` for classnames)
│   │
│   ├── pages/                # The final assembly point for a view that corresponds to a route. Pages compose layout and feature components.
│   │   ├── appointments/     # Example: Pages related to the 'appointments' feature
│   │   │   ├── AppointmentListPage.tsx
│   │   │   ├── ApoointmentDetailsPage.tsx
│   │   │   └── CreateAppointmentPage.tsx
│   │   │
│   │   ├── Dashboard.tsx     # The main dashboard view
│   │   │
│   │   ├── auth/             # Pages for authentication flows
│   │   │   └── RegisterPage.tsx
│   │   │
│   │   ├── Home.tsx          # The public-facing landing page (Route: /)
│   │   ├── Signin.tsx        # Sign in page
│   │   └── Test.tsx          # Test page
│   │
│   ├── providers/            # Wrappers that provide context to the entire application
│   │   ├── ThemeProvider.tsx
│   │   └── ReactQueryProvider.tsx
│   │
│   ├── routes/               # Routing configuration for the application
│   │   └── index.tsx         # Defines all application routes using a library like React Router DOM
│   │
│   ├── services/             # Core service configurations
│   │   └── queryClient.ts    # The global React Query client instance and its default options
│   │
│   ├── stores/               # Global Zustand stores for state that is shared across many features
│   │   └── uiStore.ts        # Example: manages the state of a global modal or notification system
│   │
│   ├── types/                # Global TypeScript types that are shared across multiple features
│   │   └── index.ts
│   │
│   ├── App.tsx               # The root React component. Connects providers and the router.
│   ├── main.tsx              # The entry point of the application where React is mounted to the DOM.
│   └── index.css             # Global stylesheets and Tailwind CSS `@layer` directives.
│
├── .eslintrc.cjs             # Configuration for ESLint, the code linter
├── .gitignore                # Specifies files and folders to be ignored by Git version control
├── bun.lockb                 # Lockfile for Bun package manager to ensure consistent dependency versions
├── index.html                # The main HTML template for this Single-Page Application (SPA)
├── package.json              # Lists project metadata, dependencies, and scripts
├── postcss.config.js         # Configuration for PostCSS (used by Tailwind CSS)
├── README.md                 # Project documentation
├── tailwind.config.js        # Configuration file for Tailwind CSS
├── tsconfig.json             # Root TypeScript compiler configuration
└── vite.config.ts            # Configuration file for the Vite build tool
```

---

## Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching & Caching:** [React Query](https://tanstack.com/query/v3/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **Routing:** [React Router DOM](https://reactrouter.com/)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [Bun](https://bun.sh/) (as a package manager)

### Installation

1.  **Clone the repository**

    ```sh
    git clone <your-repository-url>
    cd react-template
    ```

2.  **Install dependencies**
    ```sh
    bun install
    ```

### Running the Development Server

To start the Vite development server with hot-reloading, run:

```sh
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in the browser.

### Building for Production

To create a production-ready build of the application, run:

```sh
bun run build
```

This will create a `dist` folder in the project root with the optimized and minified assets.
