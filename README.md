# Frontend - AI Automated Business

The frontend interface for the AI Automated Business application, built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**. It provides a modern, responsive UI for customers and administrators.

## 🚀 Features

- **Modern UI Stack:**
  - **Vite:** Next Generation Frontend Tooling for fast development.
  - **TypeScript:** Typed JavaScript for robust code.
  - **React:** Interactive UI library.
  - **Shadcn UI:** Reusable components built with Radix UI and Tailwind CSS.
  - **Tailwind CSS:** Utility-first CSS framework.

- **Key Interfaces:**
  - **Customer Chat:** Interactive chat interface communicating with the AI Agent backend.
  - **Admin Dashboard:** Manage products, view orders, and configure business settings.
  - **Settings Page:** Update business information dynamically.

## 🛠 Prerequisites

- Node.js 18+
- npm or yarn

## 📦 Setup & Installation

1. **Install Dependencies**:

    ```bash
    npm install
    ```

## 🏃‍♂️ Running the Application

Start the development server:

```bash
npm run dev
```

- The application will be available at `http://localhost:5173`.
- It proxies API requests to `http://localhost:8000` (ensure the backend is running).

## 📂 Key Dependencies

- `react-router-dom`: For client-side routing.
- `@tanstack/react-query`: For efficient data fetching and caching.
- `axios`: For making HTTP requests to the backend.
- `lucide-react`: For iconography.

## 🏗 Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory, ready for deployment.
