export function getTenantFromSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  return import.meta.env.VITE_TENANT_ID ?? null;
}
