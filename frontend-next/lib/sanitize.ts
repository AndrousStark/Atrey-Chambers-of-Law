/**
 * HTML-encode special characters to prevent XSS when inserting
 * user-provided strings into HTML email templates.
 *
 * This covers the OWASP-recommended set of characters for HTML context.
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize a plain-text string for safe inclusion in HTML email templates.
 * Escapes HTML entities and trims whitespace.
 */
export function sanitizeForEmail(str: string): string {
  if (typeof str !== 'string') return '';
  return escapeHtml(str.trim());
}

/**
 * Validate an email address format.
 * Rejects obviously malicious inputs before they reach any template.
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  // Reasonable email regex — rejects angle brackets, scripts, etc.
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}
