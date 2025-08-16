# PictoText

## Overview

PictoText is a professional web application for extracting and manipulating text from images using advanced OCR technology. The application uses advanced OCR technology with content-aware inpainting to cleanly remove text from backgrounds, then presents the text as editable DOM elements that can be moved, styled, and customized independently. It features line-based text detection, soft mask generation, and sophisticated inpainting algorithms for professional-quality results.

## Recent Changes (August 16, 2025)

✓ **PictoText Rebrand**: Complete visual rebrand with professional SVG logo and gradient styling
✓ **Enhanced OCR Processing**: OCR.space API integration with advanced image preprocessing and confidence scoring
✓ **Professional UI**: Clean navigation with reduced menu items, modern typography and enterprise-grade appearance
✓ **Smart Image Compression**: Automatic compression for large files with quality optimization
✓ **Intelligent Filtering**: Context-aware text extraction that removes UI noise while preserving meaningful content
✓ **High-Quality Logo**: Custom SVG logo with document and text extraction visual metaphor
✓ **Streamlined Navigation**: Simplified to Home and Premium only, removing unnecessary menu clutter
✓ **Professional Branding**: "Transform Images to Editable Text" tagline with enterprise positioning

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a React Single Page Application (SPA) using TypeScript and modern React patterns:
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds

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

### Authentication & Authorization
The application architecture includes:
- **User Management**: Basic user schema with username/password authentication
- **Session Handling**: Express sessions with PostgreSQL backing store
- **Security**: Prepared for implementation of authentication middleware

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