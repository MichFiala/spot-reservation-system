# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multitenant SaaS platform (TenSpot) for spot/venue reservation management. Primary use case: fishing spots with interactive maps, online booking, and payments. Czech-language project.

## Build & Run Commands

### Backend (.NET 9)

```bash
dotnet build ./backend/SpotReservation.slnx
dotnet run --project ./backend/src/SpotReservation.Api
# API at https://localhost:5001/swagger
```

### EF Core Migrations

```bash
dotnet ef migrations add <Name> \
  --project backend/src/SpotReservation.Infrastructure \
  --startup-project backend/src/SpotReservation.Api

dotnet ef database update \
  --project backend/src/SpotReservation.Infrastructure \
  --startup-project backend/src/SpotReservation.Api
```

### Frontend (React 19 + Vite)

```bash
cd frontend
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
npm run generate-api # Generate TS client from OpenAPI spec
```

### Docker (local dev — PostgreSQL + MinIO)

```bash
docker-compose up -d
```

### Release

```bash
# Builds frontend, copies to wwwroot, publishes Docker image
release.bat <version>   # e.g. release.bat 1.0.21
# Image: michfiala/tenspot-application:<version>
```

## Architecture

### Backend — Clean Architecture

```
backend/src/
├── SpotReservation.Domain/           # Entities, ValueObjects, Enums, Exceptions, Interfaces
├── SpotReservation.Application/      # Feature services, DTOs, abstractions (Features/<Feature>/)
├── SpotReservation.Infrastructure/   # EF Core DbContext, Repositories, JWT, MinIO, Migrations
└── SpotReservation.Api/              # Minimal API endpoints, Middleware, DI setup
```

Dependency flow: Domain → Application → Infrastructure → Api

### Frontend — Feature-based React

```
frontend/src/
├── api/          # Axios client with tenant header + JWT interceptors
├── features/     # auth/, admin/, spot/, reservation-page/, landing/
├── store/        # Zustand (authStore with localStorage persistence)
├── components/   # Shared UI (Layout, ProtectedRoute)
├── types/        # TypeScript interfaces
└── utils/        # Tenant resolution, theme
```

## Key Patterns & Conventions

- **Multitenancy**: Shared DB with `tenant_id` on every table. EF Core Global Query Filter isolates data. Tenant resolved from subdomain → custom domain → JWT claim. Frontend sends `X-Tenant-Id` header via axios interceptor.
- **Primary constructors**: All .NET services/repositories use C# 12 primary constructors.
- **Minimal API endpoints**: Organized as extension methods (`app.MapAuth()`, `app.MapSpots()`, etc.) in `Endpoints/` directory.
- **Repository + UnitOfWork**: `IUnitOfWork` implemented by `AppDbContext`. Repositories per aggregate.
- **Auth**: JWT Bearer tokens. `CurrentUserService` resolves user from HttpContext. Roles: Admin, Customer.
- **File storage**: `IFileStorage` abstraction with MinIO implementation for spot photos.
- **Frontend state**: Zustand for auth (persistent), TanStack Query for server state (1min stale time).
- **Protected routes**: `<ProtectedRoute />` checks `isAdmin()` from auth store, redirects to `/login`.
- **Frontend builds into wwwroot**: Production frontend is served as static files from the .NET API.

## Tech Stack

**Backend**: .NET 9, ASP.NET Core, EF Core 9, PostgreSQL, NetTopologySuite, MinIO, BCrypt
**Frontend**: React 19, TypeScript 6, Vite 8, React Router 7, TanStack Query 5, Zustand 5, MUI 9, MapLibre GL, React Hook Form + Zod, Axios, Stripe.js