export type ExportConnection = Record<string, any>;

const PROVIDER_NAME_KEYS = [
  'healthcare_institution_name',
  'institution_name',
  'provider_name',
  'organization_name',
  'portal_name',
  'brand_name',
  'display_name',
  'name',
];

const PROVIDER_DETAIL_KEYS = [
  'city',
  'state',
  'source',
  'source_id',
  'institution_id',
  'id',
];

export function buildCallbackUrl(currentHref: string, connection: ExportConnection): string {
  const parsedURL = new URL(currentHref);
  const pathParts = parsedURL.pathname.split('/');
  pathParts.push('callback');
  parsedURL.pathname = pathParts.join('/');

  const params = new URLSearchParams(parsedURL.search);
  for (const key of Object.getOwnPropertyNames(connection)) {
    const value = connection[key];
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  parsedURL.search = params.toString();

  return parsedURL.toString();
}

export function providerDisplayName(connection: ExportConnection, index: number): string {
  for (const key of PROVIDER_NAME_KEYS) {
    const value = connection[key];
    if (hasDisplayValue(value)) {
      return String(value);
    }
  }

  const nestedName = connection['healthcare_institution']?.name || connection['institution']?.name;
  if (hasDisplayValue(nestedName)) {
    return String(nestedName);
  }

  return `Provider ${index + 1}`;
}

export function providerDetails(connection: ExportConnection): string {
  const details = PROVIDER_DETAIL_KEYS
    .map((key) => connection[key])
    .filter(hasDisplayValue)
    .map((value) => String(value));

  return Array.from(new Set(details)).join(' · ');
}

function hasDisplayValue(value: any): boolean {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}
