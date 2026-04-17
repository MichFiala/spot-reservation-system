# Spot Reservation — Backend

ASP.NET Core 9 Web API following Clean Architecture.

## Layers

```
src/
├── SpotReservation.Domain          # Entities, value objects, domain exceptions, repository interfaces
├── SpotReservation.Application     # Use-case services, DTOs, infrastructure abstractions
├── SpotReservation.Infrastructure  # EF Core (Postgres), repositories, JWT, password hashing, DI
└── SpotReservation.Api             # Controllers, middleware, Program.cs, configuration
```

Dependency direction (inner <- outer):
`Domain <- Application <- Infrastructure <- Api`

## Prerequisites

- .NET 9 SDK (see `global.json`)
- PostgreSQL 14+ reachable at the configured connection string

## Configuration

Edit `src/SpotReservation.Api/appsettings.json` or override per-environment /
via environment variables:

| Key                          | Purpose                                         |
| ---------------------------- | ----------------------------------------------- |
| `ConnectionStrings:Postgres` | Npgsql connection string                        |
| `Jwt:Issuer`                 | Issuer embedded in access tokens                |
| `Jwt:Audience`               | Expected audience for access tokens             |
| `Jwt:SigningKey`             | HMAC-SHA256 symmetric key (>= 32 chars)         |
| `Jwt:AccessTokenMinutes`     | Token lifetime                                  |

For local development, it is recommended to keep the signing key out of
source control — use `dotnet user-secrets` or environment variables:

```bash
dotnet user-secrets --project src/SpotReservation.Api init
dotnet user-secrets --project src/SpotReservation.Api set "Jwt:SigningKey" "<long-random-secret>"
```

## Running

```bash
dotnet restore
dotnet build
dotnet run --project src/SpotReservation.Api
```

Then open `https://localhost:5001/swagger` (port may vary).

## Database migrations

Create the initial migration and apply it:

```bash
dotnet ef migrations add InitialCreate \
  --project src/SpotReservation.Infrastructure \
  --startup-project src/SpotReservation.Api

dotnet ef database update \
  --project src/SpotReservation.Infrastructure \
  --startup-project src/SpotReservation.Api
```

## Endpoints

- `POST /api/auth/register`         — register a user
- `POST /api/auth/login`            — obtain a JWT
- `GET  /api/spots`                 — list spots (anonymous)
- `GET  /api/spots/{id}`            — get a spot (anonymous)
- `POST /api/spots`                 — create spot (Admin)
- `PUT  /api/spots/{id}`            — update spot (Admin)
- `DELETE /api/spots/{id}`          — delete spot (Admin)
- `POST /api/reservations`          — create a reservation
- `GET  /api/reservations/{id}`     — get a reservation (owner or Admin)
- `GET  /api/reservations/mine`     — list my reservations
- `GET  /api/reservations/by-spot/{spotId}` — reservations for a spot
- `POST /api/reservations/{id}/cancel` — cancel (owner or Admin)
