import { describe, expect, it } from '@jest/globals';
import { extractHttpUrls, isBrokenHttpStatus, normalizeHttpUrl } from './link-health';

describe('link health', () => {
  it('extracts href, src and bare urls', () => {
    const urls = extractHttpUrls(
      '<a href="https://vnexpress.net/a">x</a>',
      'Xem https://example.com/page?x=1.',
      ['https://cdn.example/cover.jpg'],
    );
    expect(urls).toEqual(expect.arrayContaining([
      'https://vnexpress.net/a',
      'https://example.com/page?x=1',
      'https://cdn.example/cover.jpg',
    ]));
  });

  it('skips local and non-http', () => {
    expect(normalizeHttpUrl('mailto:a@b.c')).toBe(null);
    expect(normalizeHttpUrl('/blog/x')).toBe(null);
    expect(normalizeHttpUrl('http://localhost:3000/x')).toBe(null);
  });

  it('treats 404 as broken and 429 as not broken', () => {
    expect(isBrokenHttpStatus(404)).toBe(true);
    expect(isBrokenHttpStatus(200)).toBe(false);
    expect(isBrokenHttpStatus(429)).toBe(false);
    expect(isBrokenHttpStatus(null)).toBe(true);
  });
});
