# SecureAuth Application

## Overview

This is a full-stack authentication application built with React/TypeScript frontend and Express.js backend. The application features Replit-based OAuth authentication, modern UI components using shadcn/ui, and a PostgreSQL database with Drizzle ORM. It provides a secure authentication flow with user session management and a dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 28, 2025)

✓ **Migration Completed**: Successfully migrated from Replit Agent to full Replit environment
✓ **Meeting Creation Fixed**: Resolved date validation errors in meeting creation API
✓ **Contact Management Enhanced**: Implemented two-type contact system with direct addition and invitation functionality using SendGrid email integration
✓ **Team Chat Enhanced**: Fixed channel display issues, added emoji support with picker, implemented real-time message syncing with reactions and individual chat capabilities
✓ **Real-time Calendar Integration**: Implemented OAuth support for Google Calendar and Microsoft Outlook with event fetching, synchronization, and real-time updates
✓ **Comprehensive Notification System**: Created centralized notification system with sound alerts for all events across contacts, chat, calendar, and meetings
✓ **Social Media Auto-Login**: Implemented automatic redirect to external social media platform with credential passing
✓ **Authentication Issues Resolved**: Fixed session handling and API authentication middleware
✓ **TypeScript Errors Fixed**: Resolved all TypeScript compilation errors with proper import statements and type definitions

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit OAuth with OpenID Connect using Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Authentication System
- **OAuth Provider**: Replit OAuth integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Protected Routes**: Middleware-based route protection
- **User Management**: Automatic user creation/update on authentication

### Database Schema
```typescript
// Core tables (mandatory for Replit Auth)
sessions: {
  sid: varchar (primary key)
  sess: jsonb (session data)
  expire: timestamp (expiration)
}

users: {
  id: varchar (primary key)
  email: varchar (unique)
  firstName: varchar
  lastName: varchar
  profileImageUrl: varchar
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Frontend Pages
- **Landing Page**: Unauthenticated users see marketing content and login options
- **Dashboard**: Authenticated users see personalized dashboard with stats and activities
- **Meeting Management**: 
  - Create Meeting: Form to schedule new meetings with date/time/participants (FIXED: Date validation issues resolved)
  - Meetings: Enhanced tabbed view with upcoming/past meetings, search functionality, and meeting history display
  - Calendar: Real-time calendar with OAuth integration for Google Calendar and Microsoft Outlook, event synchronization, notification reminders, and comprehensive calendar management (ENHANCED: Full OAuth support with sync functionality)
- **Team Chat**: Mattermost-style interface with channels sidebar, emoji picker support, real-time messaging with reactions, call/video call buttons with visual feedback, presence indicators, and enhanced message display (ENHANCED: Full emoji support and reaction system)
- **Contacts**: Two-type contact system with direct contact addition and invitation functionality using SendGrid email integration, favorites management, status indicators, and comprehensive contact management (ENHANCED: Complete invitation system with email notifications)
- **Social Media**: Auto-login redirect to https://meeting.essentiatechs.com/socialmedia/ with user credentials passed for seamless authentication (IMPLEMENTED: Auto-login with credential passing)
- **404 Page**: Standard not found page with navigation back to app

### Notification System
- **Centralized Audio Notifications**: Comprehensive notification system with distinct sound patterns for different event types (messages, calendar events, invitations, meetings, success/error states)
- **Browser Notifications**: Native browser notification support with permission handling and custom notification content
- **Real-time Event Monitoring**: Automatic monitoring for upcoming calendar events with 15-minute and 5-minute reminders
- **Cross-Feature Integration**: Notification system integrated across all application features for consistent user experience

### UI Component System
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Neutral base colors with blue brand colors
- **Responsive**: Mobile-first design with breakpoint utilities
- **Accessibility**: Radix UI primitives ensure ARIA compliance

## Data Flow

### Authentication Flow
1. User clicks login on landing page
2. Redirected to `/api/login` (Replit OAuth)
3. OAuth callback processes user data
4. User session created in PostgreSQL
5. User redirected to dashboard
6. Frontend queries `/api/auth/user` to get user data

### API Request Flow
1. Frontend makes requests with credentials included
2. Express session middleware validates session
3. Protected routes check authentication status
4. Database queries executed via Drizzle ORM
5. JSON responses sent to frontend
6. TanStack Query caches and manages response data

### State Management
- **Server State**: TanStack Query handles API data, caching, and background updates
- **Client State**: React hooks for local component state
- **Authentication State**: Custom `useAuth` hook provides auth status globally

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@tanstack/react-query**: Server state management and caching
- **passport**: Authentication middleware framework
- **openid-client**: OpenID Connect client for OAuth
- **drizzle-orm**: Type-safe database queries and schema management

### UI Dependencies
- **@radix-ui/***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server for frontend with HMR
- **Backend**: tsx with watch mode for hot reloading
- **Database**: Environment variable `DATABASE_URL` for connection
- **Sessions**: Secure session configuration with environment secrets

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Environment**: Production mode with secure cookie settings
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
```bash
DATABASE_URL=postgresql://...  # Required for database connection
SESSION_SECRET=...             # Required for session security
REPL_ID=...                   # Required for Replit OAuth
ISSUER_URL=...                # OAuth issuer URL (defaults to Replit)
REPLIT_DOMAINS=...            # Allowed domains for OAuth
```

### Security Considerations
- HTTPS-only cookies in production
- Session expiration (7 days default)
- CSRF protection via SameSite cookies
- Input validation with Zod schemas
- Type-safe database queries prevent injection

The application follows modern web development best practices with a focus on type safety, security, and developer experience. The architecture is designed to be scalable and maintainable while providing a smooth user experience.