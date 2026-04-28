export function getTenantFromSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Handle slug.localhost (dev) — e.g. rybnik-u-lesa.localhost
  if (hostname.endsWith('.localhost')) {
    return hostname.split('.')[0];
  }

  // Handle slug.domain.tld (production) — e.g. rybnik-u-lesa.example.com
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return import.meta.env.VITE_TENANT_ID ?? null;
}
