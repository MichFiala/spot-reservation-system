# ReserveSpot – Instrukční soubor pro vývoj

> Multitenant SaaS platforma pro rezervaci míst a služeb na více dní.  
> Backend: .NET 9 | Frontend: React + TypeScript | DB: PostgreSQL + PostGIS

---

## 1. Přehled systému

ReserveSpot je SaaS platforma umožňující provozovatelům areálů (rybníky, kempy, hřiště, půjčovny...) spravovat rezervace míst a služeb. Každý provozovatel je samostatný **tenant** se svým brandingem, konfigurací a platebním účtem.

### Primární use case
Rybník s interaktivní mapou stanovišť, online rezervací na více dní, platbou kartou a emailovými/SMS notifikacemi.

---

## 2. Architektura

### Obecný přehled

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│  (Vite + TypeScript + TanStack Query + MapLibre)    │
└────────────────────┬────────────────────────────────┘
                     │ REST API / SignalR
┌────────────────────▼────────────────────────────────┐
│              ASP.NET Core Web API                   │
│         (Clean Architecture + CQRS + MediatR)       │
├─────────────────────────────────────────────────────┤
│  TenantResolver │ Auth (JWT) │ Hangfire │ Stripe     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           PostgreSQL + PostGIS                      │
│        (Shared DB, TenantId na každé tabulce)       │
└─────────────────────────────────────────────────────┘
```

### .NET Solution struktura

```
ReserveSpot.sln
├── src/
│   ├── ReserveSpot.Domain/           # Entity, Value Objects, Domain Events
│   ├── ReserveSpot.Application/      # CQRS Commands/Queries, Interfaces, DTOs
│   ├── ReserveSpot.Infrastructure/   # EF Core, Repositories, Stripe, Email, SMS
│   └── ReserveSpot.API/              # Controllers, Middleware, DI setup
├── tests/
│   ├── ReserveSpot.UnitTests/
│   └── ReserveSpot.IntegrationTests/
└── docker-compose.yml
```

### React projekt struktura

```
src/
├── api/              # TanStack Query hooks + axios instance
├── components/       # Sdílené UI komponenty
├── features/
│   ├── map/          # MapLibre mapa + spot picker
│   ├── booking/      # Rezervační wizard
│   ├── auth/         # Login, registrace
│   ├── dashboard/    # Admin panel
│   └── admin/        # Správa spotů, rezervací, zákazníků
├── store/            # Zustand (global state)
├── types/            # TypeScript typy
└── utils/
```

---

## 3. Multitenancy

### Přístup: Shared Database + TenantId

Každá tabulka obsahuje `TenantId` (UUID). EF Core Global Query Filter automaticky filtruje data per tenant.

```csharp
// TenantContext – injektován všude
public interface ITenantContext
{
    Guid TenantId { get; }
    string? Subdomain { get; }
}

// EF Core Global Query Filter
modelBuilder.Entity<Spot>()
    .HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
```

### TenantResolver Middleware

Tenant se resolvuje z každého HTTP requestu:

1. **Subdoména** → `rybniklucany.reservespot.cz`
2. **Custom doména** → `rezervace.rybniklucany.cz`
3. **JWT claim** → `tenant_id` v tokenu

```csharp
public class TenantResolverMiddleware
{
    // 1. Zkus subdoménu
    // 2. Zkus custom doménu z DB lookup
    // 3. Zkus JWT claim
    // 4. Ulož do ITenantContext
}
```

### Tenant routing (frontend)

```typescript
// axios interceptor – přidá hlavičku ke každému requestu
axios.interceptors.request.use(config => {
  config.headers['X-Tenant-Id'] = getTenantFromSubdomain();
  return config;
});
```

---

## 4. Databázové schéma

### Klíčové tabulky

```sql
-- Tenant (provozovatel)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(200),
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free | pro | business
    stripe_account_id VARCHAR(100),
    platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spot (stanoviště / místo)
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(100),              -- fishing_spot | cottage | boat | dock
    capacity INT NOT NULL DEFAULT 1,
    price_per_day DECIMAL(10,2) NOT NULL,
    price_weekend DECIMAL(10,2),    -- přebije price_per_day o víkendu
    location GEOMETRY(Point, 4326), -- PostGIS
    is_active BOOLEAN NOT NULL DEFAULT true,
    min_stay_days INT NOT NULL DEFAULT 1,
    max_stay_days INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zákazník
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(300) NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, email)
);

-- Rezervace
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    spot_id UUID NOT NULL REFERENCES spots(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    persons INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending | confirmed | cancelled | no_show | completed
    total_price DECIMAL(10,2) NOT NULL,
    note TEXT,
    admin_note TEXT,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platba
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    stripe_payment_intent_id VARCHAR(200),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CZK',
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    -- unpaid | paid | refunded | partially_refunded | failed
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blokování termínů (údržba, soukromá akce)
CREATE TABLE spot_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    spot_id UUID NOT NULL REFERENCES spots(id),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Konfigurace tenantu
CREATE TABLE tenant_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id),
    timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Prague',
    currency VARCHAR(10) NOT NULL DEFAULT 'CZK',
    min_booking_advance_days INT NOT NULL DEFAULT 1,
    cancellation_free_days INT NOT NULL DEFAULT 7,
    require_admin_approval BOOLEAN NOT NULL DEFAULT false,
    deposit_percent DECIMAL(5,2),    -- NULL = platit celou částku
    season_start DATE,
    season_end DATE,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1E3A5F',
    notification_email VARCHAR(300),
    notification_phone VARCHAR(50)
);

-- Audit log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    actor_id UUID,
    actor_type VARCHAR(50),          -- admin | customer | system
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexy
CREATE INDEX idx_spots_tenant ON spots(tenant_id);
CREATE INDEX idx_spots_location ON spots USING GIST(location);
CREATE INDEX idx_reservations_tenant ON reservations(tenant_id);
CREATE INDEX idx_reservations_spot_dates ON reservations(spot_id, date_from, date_to);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
```

---

## 5. API Endpoints

### Auth
```
POST   /api/auth/register          # Registrace zákazníka
POST   /api/auth/login             # Login (vrátí JWT)
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout
```

### Spots (veřejné)
```
GET    /api/spots                  # Seznam spotů (s filtry)
GET    /api/spots/{id}             # Detail spotu
GET    /api/spots/{id}/availability?from=&to=   # Dostupné dny
GET    /api/spots/map              # GeoJSON pro mapu
```

### Rezervace (zákazník)
```
POST   /api/reservations           # Vytvoř rezervaci
GET    /api/reservations/my        # Moje rezervace
GET    /api/reservations/{id}      # Detail
DELETE /api/reservations/{id}      # Storno
```

### Platby
```
POST   /api/payments/create-intent/{reservationId}   # Stripe PaymentIntent
POST   /api/payments/webhook                          # Stripe webhook
GET    /api/payments/{reservationId}                  # Status platby
```

### Admin – Rezervace
```
GET    /api/admin/reservations     # Všechny rezervace (filtr, stránkování)
GET    /api/admin/reservations/{id}
PUT    /api/admin/reservations/{id}/confirm
PUT    /api/admin/reservations/{id}/cancel
PUT    /api/admin/reservations/{id}/complete
POST   /api/admin/reservations     # Manuální vytvoření
```

### Admin – Spoty
```
GET    /api/admin/spots
POST   /api/admin/spots
PUT    /api/admin/spots/{id}
DELETE /api/admin/spots/{id}
POST   /api/admin/spots/{id}/block      # Blokování termínu
DELETE /api/admin/spots/{id}/block/{blockId}
```

### Admin – Zákazníci
```
GET    /api/admin/customers
GET    /api/admin/customers/{id}
PUT    /api/admin/customers/{id}/blacklist
```

### Admin – Dashboard
```
GET    /api/admin/stats/overview        # Příjmy, obsazenost, počty
GET    /api/admin/stats/calendar        # Timeline view data
```

### Tenant (SuperAdmin)
```
GET    /api/superadmin/tenants
POST   /api/superadmin/tenants
PUT    /api/superadmin/tenants/{id}
PUT    /api/superadmin/tenants/{id}/deactivate
```

---

## 6. Feature seznam

### 6.1 Mapa (Frontend)

- MapLibre GL JS s GeoJSON vrstvou spotů
- Barevné kódování: 🟢 volné | 🔴 obsazené | 🟡 vybrané
- Kliknutím na spot → sidebar s detailem a kalendářem
- Filtrování dostupnosti dle vybraného rozsahu dat
- Mobilní responzivita (swipe, pinch-to-zoom)

### 6.2 Rezervační wizard

```
Krok 1: Výběr místa (nebo přes mapu)
Krok 2: Výběr termínu (date picker, zobrazí cenu)
Krok 3: Osobní údaje (přihlášení nebo jako host)
Krok 4: Platba (Stripe Elements)
Krok 5: Potvrzení (číslo rezervace, shrnutí, PDF)
```

### 6.3 Platby (Stripe Connect)

- Platforma má master Stripe účet
- Každý tenant se napojí přes **Stripe Connect Express**
- Platby jdou přímo tenantovi, platforma strhne `platform_fee_percent`
- Záloha (deposit_percent) nebo plná platba – konfigurovatelné
- Automatický refund při stornování dle podmínek
- Stripe webhook → aktualizace stavu platby

```csharp
// Příklad vytvoření PaymentIntent se Stripe Connect
var options = new PaymentIntentCreateOptions {
    Amount = (long)(reservation.TotalPrice * 100),
    Currency = "czk",
    ApplicationFeeAmount = (long)(reservation.TotalPrice * tenant.PlatformFeePercent / 100 * 100),
    TransferData = new PaymentIntentTransferDataOptions {
        Destination = tenant.StripeAccountId
    }
};
```

### 6.4 Notifikace

#### Email (SendGrid / Mailgun)
| Trigger | Šablona |
|---|---|
| Rezervace vytvořena | Potvrzení s detaily + PDF |
| Platba přijata | Účtenka |
| Rezervace potvrzena adminem | Potvrzení |
| Rezervace stornována | Info + refund status |
| X dní před příjezdem | Připomenutí |
| Rezervace zákazníka | Interní notif. admina |

#### SMS (Twilio / Vonage)
| Trigger | Zpráva |
|---|---|
| Rezervace potvrzena | Krátké shrnutí + datum |
| Den před příjezdem | Připomenutí |

### 6.5 Admin panel

- **Dashboard**: příjmy (den/týden/měsíc), obsazenost %, nové rezervace
- **Kalendář**: timeline všech spotů (Gantt-like view)
- **Rezervace**: tabulka s filtrováním, řazením, stránkováním
- **Spoty**: CRUD, upload fotek, blokování termínů, ceník
- **Zákazníci**: seznam, detail, blacklist
- **Konfigurace**: branding, podmínky, platby, notifikace

### 6.6 Konfigurace tenantu

- Timezone, měna
- Minimální předstih rezervace
- Storno podmínky (X dní zdarma, pak % poplatek)
- Manuální schválení ON/OFF
- Výše zálohy
- Sezóna (od–do)
- Branding (logo, barva)

---

## 7. Background Jobs (Hangfire)

```csharp
// Registrace jobů
RecurringJob.AddOrUpdate<ReminderJob>(
    "send-reminders", x => x.Execute(), Cron.Daily);

RecurringJob.AddOrUpdate<ExpiredReservationJob>(
    "expire-reservations", x => x.Execute(), Cron.Hourly);

RecurringJob.AddOrUpdate<InvoiceJob>(
    "generate-invoices", x => x.Execute(), Cron.Daily);
```

| Job | Spouštění | Akce |
|---|---|---|
| ReminderJob | Denně | Odešle email/SMS 3 dny před příjezdem |
| ExpiredReservationJob | Každou hodinu | Zruší neplacené rezervace po X minutách |
| InvoiceJob | Denně | Generuje PDF faktury |
| SeasonCheckJob | Denně | Deaktivuje spoty mimo sezónu |

---

## 8. Bezpečnost

### Role

| Role | Přístup |
|---|---|
| `Customer` | Vlastní rezervace, profil |
| `Admin` | Vše v rámci svého tenantu |
| `SuperAdmin` | Všechny tenanty, platforma |

### JWT

```csharp
// Claims v tokenu
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "role": "Admin",
  "exp": 1234567890
}
```

### Bezpečnostní opatření

- Rate limiting na rezervační endpoint (prevence spamu)
- EF Core Global Query Filter – izolace dat mezi tenanty
- Stripe webhook signature verifikace
- CORS konfigurace per tenant doménu
- Audit log všech admin akcí

---

## 9. Plány (SaaS tiers)

| Feature | Free | Pro | Business |
|---|---|---|---|
| Počet spotů | 5 | 50 | Neomezeně |
| SMS notifikace | ❌ | ✅ | ✅ |
| Custom doména | ❌ | ✅ | ✅ |
| Analytiky | Základní | Pokročilé | Pokročilé + export |
| Manuální schválení | ❌ | ✅ | ✅ |
| Platform fee | 3 % | 1,5 % | 0,5 % |
| Podpora | Email | Prioritní email | Dedikovaná |

---

## 10. Technologický stack

### Backend
| Technologie | Verze | Účel |
|---|---|---|
| .NET | 9 | Runtime |
| ASP.NET Core | 9 | Web API |
| Entity Framework Core | 9 | ORM |
| MediatR | 12 | CQRS |
| FluentValidation | 11 | Validace |
| PostgreSQL | 16 | Databáze |
| PostGIS | 3.4 | Prostorová data |
| NetTopologySuite | 2.x | Geometrie v EF |
| Hangfire | 1.8 | Background jobs |
| Stripe.net | latest | Platby |
| SendGrid | latest | Email |
| Twilio | latest | SMS |
| Serilog | 3 | Logování |

### Frontend
| Technologie | Verze | Účel |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5 | Typy |
| Vite | 5 | Build |
| TanStack Query | 5 | Server state |
| Zustand | 4 | Client state |
| MapLibre GL JS | 4 | Mapa |
| React Hook Form | 7 | Formuláře |
| Zod | 3 | Validace schémat |
| Stripe.js | latest | Platební UI |
| Tailwind CSS | 3 | Stylování |
| date-fns | 3 | Práce s daty |

---

## 11. Docker Compose (lokální vývoj)

```yaml
version: '3.9'
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: reservespot
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./src/ReserveSpot.API
    ports:
      - "5000:80"
    environment:
      ConnectionStrings__Default: "Host=db;Database=reservespot;Username=postgres;Password=postgres"
      Stripe__SecretKey: "${STRIPE_SECRET_KEY}"
      Stripe__WebhookSecret: "${STRIPE_WEBHOOK_SECRET}"
    depends_on:
      - db

  hangfire:
    build: ./src/ReserveSpot.API
    command: ["--worker"]
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: "http://localhost:5000"

volumes:
  pgdata:
```

---

## 12. Postup implementace (doporučené pořadí)

### Fáze 1 – Základ (2–3 týdny)
1. Solution setup, Clean Architecture struktura
2. EF Core + PostgreSQL + PostGIS migrace
3. Multitenancy middleware + Global Query Filter
4. JWT Auth (registrace, login, refresh)
5. CRUD pro Tenants, Spots, Customers
6. Základní Reservation flow (create, cancel)

### Fáze 2 – Platby & Notifikace (1–2 týdny)
7. Stripe Connect integrace
8. PaymentIntent flow + webhook handler
9. SendGrid email notifikace
10. Hangfire jobs (reminder, expiry)

### Fáze 3 – Frontend (2–3 týdny)
11. React projekt setup (Vite + Tailwind + TanStack Query)
12. Auth pages (login, registrace)
13. MapLibre mapa + spot markers
14. Rezervační wizard
15. Stripe Elements integrace

### Fáze 4 – Admin & Polish (1–2 týdny)
16. Admin dashboard + tabulky
17. Kalendář / timeline view
18. Konfigurace tenantu
19. SMS notifikace (Twilio)
20. SuperAdmin panel

### Fáze 5 – SaaS & Launch
21. Subdoménový routing
22. Custom doména podpora
23. Plány (Free/Pro/Business) + omezení
24. Onboarding flow pro nové tenanty
25. Monitoring (health checks, Serilog + Seq)

---

## 13. Klíčová business pravidla

```
1. Nelze rezervovat obsazený spot (kontrola překryvu termínů)
2. Nelze rezervovat méně než min_booking_advance_days dopředu
3. Nelze rezervovat kratší pobyt než min_stay_days
4. Nelze rezervovat v blokovaném termínu
5. Mimo sezónu → spot automaticky nedostupný
6. Neplacená rezervace expiruje po 30 minutách
7. Storno zdarma pouze do cancellation_free_days před příjezdem
8. Zákazník na blacklistu nemůže vytvořit rezervaci
9. Admin může vytvořit rezervaci i bez platby (hotovost)
10. Stripe webhook je jediný zdroj pravdy pro stav platby
```

---

*Verze dokumentu: 1.0 | Připraveno pro zahájení vývoje*