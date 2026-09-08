import { describe, expect, it } from '@jest/globals';
import { normalizeGa4Id, pickImageUrl, toPlainDescription } from './seo';

describe('seo helpers', () => {
  it('normalizes GA4 measurement ids', () => {
    expect(normalizeGa4Id('g-abc12345')).toBe('G-ABC12345');
    expect(normalizeGa4Id('GT-XXXX9999')).toBe('GT-XXXX9999');
    expect(normalizeGa4Id('not-valid')).toBe(null);
    expect(normalizeGa4Id('')).toBe(null);
  });

  it('truncates descriptions and strips tags', () => {
    expect(toPlainDescription('<p>Gây quỹ học bổng</p>', 160)).toBe('Gây quỹ học bổng');
    const long = 'a'.repeat(200);
    const out = toPlainDescription(long, 160);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBe(160);
  });

  it('picks the first usable image', () => {
    expect(pickImageUrl('', null, 'https://cdn.example/cover.jpg')).toBe('https://cdn.example/cover.jpg');
  });
});
