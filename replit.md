# PictoText

## Overview

PictoText is a professional web application for extracting and manipulating text from images using advanced OCR technology. The application uses advanced OCR technology with content-aware inpainting to cleanly remove text from backgrounds, then presents the text as editable DOM elements that can be moved, styled, and customized independently. It features line-based text detection, soft mask generation, and sophisticated inpainting algorithms for professional-quality results.

## Recent Changes (August 19, 2025)

✓ **Cloudflare Pages Structure**: Restructured project for Cloudflare Pages deployment
✓ **Frontend Migration**: Moved React/Vite frontend code to `/src` directory  
✓ **Backend Organization**: Maintained Express backend in `/server` directory
✓ **Build Configuration**: Created `wrangler.toml` and custom build script for deployment
✓ **Static Assets**: Set up `/public` folder for static assets and HTML entry point
✓ **Production Ready**: Build outputs both frontend and backend to `/dist` for deployment

## Previous Changes (August 17, 2025)

✓ **Google OAuth Integration**: Implemented full Google OAuth authentication with passport.js
✓ **Social Authentication UI**: Added professional Google sign-in button with clean separator styling
✓ **OAuth User Management**: Extended user schema to support OAuth providers and IDs
✓ **Simplified Auth Options**: Removed Facebook/Apple, focusing on email registration + Google OAuth
✓ **Production-Ready OAuth**: Configured callback URLs for production domain deployment
✓ **Session Management**: Integrated passport session handling with existing authentication system
✓ **Anonymous Usage Support**: Major architectural change - free tier no longer requires login
✓ **Session-Based Tracking**: Anonymous users can use 3 free extractions per day via session tracking
✓ **Smart Authentication Flow**: Only prompt for login when users exceed their daily limit
✓ **Enhanced Usage API**: Modified /api/usage and /api/extract-text to support both authenticated and anonymous users
✓ **Memory Storage Adaptation**: Extended memory storage to handle anonymous user tracking with session IDs
✓ **Seamless User Experience**: Users can start using the app immediately without barriers
✓ **PictoText Rebrand**: Complete visual rebrand with professional SVG logo and gradient styling
✓ **Enhanced OCR Processing**: OCR.space API integration with advanced image preprocessing and confidence scoring
✓ **Dual OCR System**: Implemented robust fallback system - OCR.space primary with local Tesseract.js backup for 100% reliability
✓ **Premium User Experience**: Fixed upgrade button visibility and ensured seamless authentication flow
✓ **Accurate Tier Limits**: Updated all UI references from "unlimited" to precise "1500 extractions per month" for premium tier
✓ **Monthly Usage Tracking**: Backend properly enforces 1500 monthly extraction limit for premium users with automatic reset
✓ **Professional UI**: Clean navigation with reduced menu items, modern typography and enterprise-grade appearance
✓ **Smart Image Compression**: Automatic compression for large files with quality optimization
✓ **Intelligent Filtering**: Context-aware text extraction that removes UI noise while preserving meaningful content

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a React Single Page Application (SPA) using TypeScript and modern React patterns:
- **Framework**: React 18 with TypeScript for type safety
- **Project Structure**: Frontend code organized in `/src` directory for Cloudflare Pages compatibility
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds
- **Static Assets**: `/public` directory containing HTML entry point and static resources

### Backend Architecture
The backend follows an Express.js RESTful API architecture:
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Storage Interface**: Abstracted storage layer with in-memory implementation (easily extensible to database)
- **API Design**: RESTful endpoints with consistent JSON responses

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle ORM)
- **ORM**: Drizzle ORM with zod schema validation
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Current Implementation**: In-memory storage for development (MemStorage class)
- **Anonymous Tracking**: Session-based usage tracking for non-authenticated users using `anon_${sessionId}` prefix

### Authentication & Authorization
The application supports multiple authentication methods:
- **Anonymous Usage**: Free tier (3 images/day) requires no authentication, tracked by session ID
- **Email Registration**: Traditional username/password authentication with bcrypt hashing
- **Google OAuth**: One-click Google sign-in using passport-google-oauth20 strategy
- **User Management**: Extended user schema supporting both local and OAuth accounts
- **Session Handling**: Express sessions with passport.js integration for OAuth flows
- **Smart Authentication**: Only prompts for login when anonymous users exceed daily limits
- **Progressive Enhancement**: Seamless upgrade path from anonymous to authenticated premium user

### File Processing Architecture
- **Upload Handling**: Client-side file validation and progress tracking
- **File Size Limits**: Configurable limits (10MB default for basic users)
- **Batch Processing**: Architecture supports future batch upload functionality
- **OCR Processing**: Designed to integrate with external OCR services

### Component Architecture
- **Design System**: Consistent UI components using shadcn/ui and Radix primitives
- **Responsive Design**: Mobile-first approach with adaptive navigation
- **State Management**: Hooks-based state management with React Query for server state
- **Form Handling**: React Hook Form with zod validation integration

### Development Environment
- **Development Server**: Vite dev server with HMR and error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Build Process**: ESBuild for server bundling, Vite for client bundling
- **Path Aliases**: Configured for clean imports (@/, @shared/)
- **Cloudflare Pages**: Structured for seamless deployment with `wrangler.toml` configuration
- **Custom Build Script**: `build-cf.js` for optimized production builds targeting Cloudflare Pages

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database driver
- **drizzle-orm & drizzle-kit**: Database ORM and migration toolkit
- **express**: Node.js web application framework
- **vite**: Frontend build tool and dev server

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing CSS class variants
- **clsx & tailwind-merge**: Class name utilities

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Form validation resolvers

### Development Tools
- **tsx**: TypeScript execution environment
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **zod**: Schema validation and type inference
- **wouter**: Lightweight React router

### Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions

The application is designed with extensibility in mind, allowing for easy integration of actual OCR services, payment processing, and enhanced authentication systems.