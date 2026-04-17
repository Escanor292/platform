/**
 * URL validation and normalization for link handling
 */

/**
 * Normalize URL by adding protocol if missing
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  
  if (!trimmed) return '';
  
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https:// by default
  return `https://${trimmed}`;
}

/**
 * Validate if string is a valid URL
 */
export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  
  if (!trimmed) return false;
  
  try {
    const normalized = normalizeUrl(trimmed);
    const url = new URL(normalized);
    
    // Must have valid protocol and hostname
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0 &&
      url.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

/**
 * Get validation error message
 */
export function getUrlError(input: string): string | null {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return 'URL không được để trống';
  }
  
  if (!isValidUrl(trimmed)) {
    return 'URL không hợp lệ. Ví dụ: example.com hoặc https://example.com';
  }
  
  return null;
}

/**
 * Sanitize URL input
 */
export function sanitizeUrlInput(input: string): string {
  return input.trim();
}
