# ERP Project - Agent Guide

## Commands
- **Dev**: `npm run dev` (uses Turbopack for fast development)
- **Build**: `npm run build` (builds the Next.js app)
- **Lint**: `npm run lint` (runs ESLint with Next.js config)
- **Start**: `npm start` (starts production build)

## Architecture
- **Framework**: Next.js 15 with App Router (latest stable)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Structure**: Standard Next.js app directory structure
  - `app/` - App Router pages and layouts
  - `public/` - Static assets
  - Root level config files (next.config.ts, tsconfig.json, etc.)

## Code Style
- **TypeScript**: Strict mode, ES2017 target, path alias `@/*` for root imports
- **Components**: Function components with TypeScript, proper prop typing
- **Imports**: Use ES6 imports, `import type` for type-only imports
- **Naming**: camelCase for variables/functions, PascalCase for components
- **CSS**: Tailwind classes, CSS variables for theming, dark mode support
- **Formatting**: ESLint with Next.js core-web-vitals and TypeScript configs
