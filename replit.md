# replit.md

## Overview

This is a Travel Destination Poll application built with React, TypeScript, and Vite. Users can submit ranked-choice votes for their preferred travel destinations (first, second, and third choice), and administrators can view results, manage votes, and configure weighting systems. The app uses localStorage for data persistence and features a mobile-first design with a bottom tab navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Routing**: React Router DOM with simple two-tab navigation (Poll and Admin)
- **State Management**: React hooks with localStorage persistence via custom `useVotes` hook
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Data Fetching**: TanStack React Query (available but not heavily utilized since data is local)
- **Charts**: Recharts for visualizing poll results

### Component Structure

- `/src/components/ui/` - Reusable shadcn/ui components (buttons, cards, forms, etc.)
- `/src/components/poll/` - Poll-specific components (PollForm, PollHeader, TabNavigation)
- `/src/components/admin/` - Admin dashboard components (AdminLogin, AdminDashboard, ResultsCharts, Leaderboard)
- `/src/pages/` - Route-level page components (Index, NotFound)
- `/src/hooks/` - Custom React hooks including the core `useVotes` hook
- `/src/types/` - TypeScript type definitions for poll data structures

### Data Storage

- **Persistence**: Browser localStorage with JSON serialization
- **Vote Data**: Stored as an array of Vote objects with id, name, choices, timestamps
- **Poll Rounds**: Historical rounds archived with results
- **Admin Configuration**: Weight configs, hide results toggle, admin password

### Design System

- Uses HSL color variables defined in CSS custom properties
- Supports light/dark mode via CSS class toggling
- Custom color tokens for poll-specific UI (gold, silver, bronze for rankings)
- Responsive design optimized for mobile (max-width 768px breakpoint)

### Key Design Decisions

1. **localStorage over backend**: Chosen for simplicity; the app runs entirely client-side without server dependencies
2. **Ranked-choice voting with weighted points**: First/second/third choices get configurable point values (default 3-2-1)
3. **Admin authentication**: Simple password-based login stored in localStorage (default: "admin123")
4. **Component library**: shadcn/ui provides consistent, accessible UI components that can be customized

## External Dependencies

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-styled component collection (configured in components.json)
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Build tool and dev server (configured for port 5000)
- **TypeScript**: Type checking with relaxed strictness settings
- **ESLint**: Linting with React Hooks and React Refresh plugins
- **Tailwind CSS**: Utility-first CSS with PostCSS

### Data & State
- **TanStack React Query**: Async state management (available for future API integration)
- **React Hook Form + Zod**: Form handling with validation (resolvers installed)
- **date-fns**: Date formatting utilities

### Visualization
- **Recharts**: Chart library for displaying poll results

### Other
- **vaul**: Drawer component for mobile
- **sonner**: Toast notifications
- **next-themes**: Theme switching support
- **embla-carousel-react**: Carousel component
- **cmdk**: Command palette component