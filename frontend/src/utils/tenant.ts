import { useSearchParams } from "react-router-dom";

export function getTenantFromSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Dev: slug.localhost
  if (hostname.endsWith('.localhost')) {
    return hostname.split('.')[0];
  }

  const parts = hostname.split('.');

  // Prod: potřebujeme přesně 3 části (slug.domain.tld)
  // a první část nesmí být rezervovaná subdoména
  const RESERVED = new Set(['www', 'api', 'mail', 'smtp', 'ftp', 'admin', 'minio', 'cdn']);

  if (parts.length === 3 && !RESERVED.has(parts[0])) {
    return parts[0];
  }

  return null;
}

export function useTenantId() {
  const id = getTenantFromSubdomain();

  const [searchParams] = useSearchParams();

  const tenantId = id ?? searchParams.get("pageId") ?? "";

  return tenantId;
}