export const TOOLBOX_ACCESS_EMAIL_COOKIE = 'toolbox_access_email';

export function getToolboxAccessExternalId(document: Document): string {
  const encodedEmail = document.cookie
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${TOOLBOX_ACCESS_EMAIL_COOKIE}=`))
    ?.slice(TOOLBOX_ACCESS_EMAIL_COOKIE.length + 1);

  if (!encodedEmail) {
    return '';
  }

  try {
    const email = decodeURIComponent(encodedEmail);
    const bytes = new TextEncoder().encode(email);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}
