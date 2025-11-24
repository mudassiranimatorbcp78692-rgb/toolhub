# Office Tools Hub

## Overview

Office Tools Hub is a free, web-based productivity platform that provides a comprehensive suite of online tools for PDF manipulation, image processing, text utilities, generators, and calculators. The application is designed with a client-side processing architecture, ensuring user privacy and fast performance without requiring user authentication or file uploads to servers.

The platform aims to be an all-in-one toolbox for common office tasks, inspired by modern SaaS tools like Notion, Linear, and Smallpdf, with a focus on simplicity, efficiency, and accessibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router with similar functionality.

**UI Component System**: Radix UI primitives with shadcn/ui styling system, configured in the "new-york" style variant. Components follow a composition pattern with variant-based styling using class-variance-authority (CVA).

**Styling**: Tailwind CSS with custom design tokens defined through CSS variables. The design system supports light and dark themes with a neutral base color scheme. Custom Tailwind utilities include hover and active elevation effects (`hover-elevate`, `active-elevate-2`) for interactive elements.

**State Management**: React Query (TanStack Query) for server state management, with custom query functions that handle authentication errors and HTTP responses. Local component state managed through React hooks.

**Theme System**: Custom theme provider using React Context API, persisting theme preference to localStorage with the key `office-tools-theme`. Supports light and dark modes with system-level CSS variable switching.

**Client-Side Processing**: All file processing operations happen entirely in the browser using Web APIs. This architectural decision ensures:
- No file uploads to servers (privacy-first approach)
- Fast processing without network latency
- No backend storage requirements for user files
- Reduced server costs and infrastructure complexity

### Backend Architecture

**Runtime**: Node.js with Express.js framework.

**Build System**: 
- Development: tsx for TypeScript execution with hot module replacement via Vite middleware
- Production: esbuild for bundling server code, Vite for client build

**API Design**: RESTful endpoints with minimal server-side logic. Current endpoints include:
- Template download routes (`/api/templates/download/:templateId`)
- SEO routes (sitemap.xml)
- Static file serving in production

**Session Management**: Express session handling prepared with connect-pg-simple for PostgreSQL session storage (currently minimal server state).

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhook handling
- URL-encoded form data parsing
- Request logging with timestamp formatting
- Custom error handling

### Data Storage Solutions

**Database ORM**: Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless` driver.

**Schema Design**: Located in `shared/schema.ts` using Zod for runtime validation. Current schemas include:
- Template metadata (categories: resume, invoice, salary-slip, offer-letter, office-forms)
- Tool category definitions
- Individual tool metadata
- File processing metadata (for future analytics)

**Migration Strategy**: Drizzle Kit for schema migrations with push-based deployment.

**Storage Interface**: Abstracted through `IStorage` interface with in-memory implementation (`MemStorage`). This design allows future extensibility for:
- User account systems
- Saved project storage
- Usage analytics
- Pro feature gating

**Current Storage Philosophy**: Minimal server-side data persistence since tools process files client-side. Database used primarily for:
- Template catalog
- Tool metadata and categorization
- Future user preferences and history

### Authentication and Authorization

**Current State**: No authentication system implemented. All tools are publicly accessible without login requirements.

**Future Consideration**: Storage interface designed to accommodate future auth integration for premium features, project saving, and user preferences.

### External Dependencies

**UI Component Libraries**:
- Radix UI (comprehensive set of unstyled, accessible components)
- Embla Carousel for template/tool showcases
- cmdk for command palette functionality
- lucide-react for consistent iconography

**Development Tools**:
- Vite with React plugin for fast development experience
- Replit-specific plugins for error overlays, cartographer, and dev banner
- TypeScript for type safety with strict mode enabled

**Styling & Utilities**:
- Tailwind CSS with PostCSS and Autoprefixer
- clsx and tailwind-merge (via custom `cn` utility) for conditional class composition
- date-fns for date formatting in templates

**Form Handling**:
- React Hook Form with Zod resolvers for validation
- Drizzle Zod integration for schema-based form validation

**Database & ORM**:
- Neon serverless PostgreSQL driver
- Drizzle ORM for type-safe database queries

**Fonts**: Google Fonts (Inter and DM Sans) loaded via link tags in index.html

**Design System Reference**: Material Design principles combined with modern SaaS tool patterns (documented in `design_guidelines.md`)

### Reviews System

**Features:**
- Users can submit 5-star ratings and comments for any tool
- Reviews are displayed on tool pages with newest first
- Max 500 characters per review
- Name and email fields (email optional)
- All reviews stored in API memory (can be upgraded to persistent DB)

**Implementation:**
- API endpoint: `/api/reviews` (POST to submit, GET to fetch)
- React component: `ReviewsComponent` - drop into tool pages
- Schema validation with Zod for data integrity

### Deployment Architecture

**Development Mode**: 
- Vite dev server with middleware mode on port 5000
- HMR (Hot Module Replacement) for instant updates
- Dynamic index.html serving with cache-busting query parameters
- Server configured with `host: 0.0.0.0` and `allowedHosts: true` for Replit proxy compatibility (development only)

**Production Mode**:
- Pre-built static assets served from `dist/public`
- SPA fallback routing (all routes serve index.html)
- Bundled server code executed with Node.js
- Deployment: Autoscale deployment configured with build command `npm run build` and start command `npm start`

**Environment Configuration**: 
- DATABASE_URL optional (app uses in-memory storage by default via MemStorage)
- PORT environment variable for server port (defaults to 5000)

**Vercel Deployment** (Added November 2025):
- Serverless functions in `/api` directory for backend routes
- Frontend builds to `dist/` directory
- `vercel.json` configuration for routing and SPA support
- Build command: `npm run vercel-build` (runs `vite build`)
- All Express routes converted to Vercel serverless function format
- Environment variables: GMAIL_USER, GMAIL_APP_PASSWORD for contact form
- See `VERCEL_DEPLOYMENT_GUIDE.md` for complete deployment instructions