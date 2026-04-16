/**
 * URL validation and normalization utilities
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

export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  
  if (!trimmed) return false;
  
  try {
    const normalized = normalizeUrl(trimmed);
    const url = new URL(normalized);
    
    // Must have valid protocol and hostname
    return (url.protocol === 'http:' || url.protocol === 'https:') && 
           url.hostname.length > 0 &&
           url.hostname.includes('.');
  } catch {
    return false;
  }
}

export function isValidUrlOrEmpty(input: string): boolean {
  return input.trim() === '' || isValidUrl(input);
}

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
