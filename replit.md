# AI News Platform

## Overview

This is a modern, full-stack news platform focused on artificial intelligence content. The application features a clean, responsive design with article browsing, categorization, and user engagement features. Built with React on the frontend and Express.js on the backend, it uses PostgreSQL for data persistence and includes a comprehensive UI component library.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a component-based architecture with reusable UI components, custom hooks for shared logic, and a clean separation between pages and components. The design system uses CSS variables for theming and maintains consistent styling across the application.

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful API structure with organized route handlers
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations
- **Development Setup**: Hot reloading with proper error handling and request logging

The backend uses a layered architecture with separate concerns for routing, business logic, and data access. The storage interface allows for easy switching between different data persistence strategies.

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for schema definition and migrations
- **Schema Management**: Type-safe schema definitions shared between frontend and backend
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Session Storage**: PostgreSQL-backed session storage for user authentication

The database schema is version-controlled and uses migrations for safe schema updates. The shared schema approach ensures type consistency across the full stack.

### Authentication & Session Management
- **Session Strategy**: Server-side sessions with PostgreSQL storage using connect-pg-simple
- **User Model**: Username/password authentication with hashed passwords
- **Security**: Secure session cookies with proper configuration for production deployment

### Development & Deployment
- **Environment**: Configured for both development and production environments
- **Build Process**: Separate build steps for frontend (Vite) and backend (esbuild)
- **Development Tools**: TypeScript compilation, hot reloading, and comprehensive linting setup
- **Replit Integration**: Special configuration for Replit development environment with cartographer plugin

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod validation
- **Backend Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL via Neon Database serverless connection
- **ORM**: Drizzle ORM with Drizzle Kit for migrations

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration with custom font loading

### Development Tools
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development Plugins**: Replit-specific plugins for enhanced development experience

### Data Management
- **State Management**: TanStack Query for server state and caching
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Utility Libraries**: clsx and class-variance-authority for conditional styling

### Production Dependencies
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Security**: Proper session configuration and CORS handling
- **Performance**: Optimized builds and asset management for production deployment