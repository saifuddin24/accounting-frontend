# Frontend Setup - Simple Accounting Web

This is the frontend application for the Simple Accounting system, built with Vue 3 and Vite.

## Prerequisites

- **Node.js**: ^20.19.0 or >=22.12.0
- **npm** (comes with Node.js)

## Installation Steps

1. **Clone the repository** (if not already done).
2. **Install npm dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - Create a `.env.local` file (if it doesn't exist) to define the API base URL:
     ```env
     VITE_API_BASE_URL=http://localhost:8000/api
     ```

## Running the Application

### Development Mode

To start the development server with hot-reload:

```bash
npm run dev
```

### Network Access

To host the application on your local network:

```bash
npm run host
```

## Building for Production

To create a production-ready bundle:

```bash
npm run build
```

The output will be in the `dist` directory.

## Features

- **Vue 3**: Composition API for reactive components.
- **Pinia**: State management.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide Vue Next**: For icons.
- **Axios**: For API requests.
