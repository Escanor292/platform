import { cacheGet, cacheSet, cacheDel, buildCampaignsCacheKey, STATS_CACHE_KEY } from '@/lib/redis-cache';

describe('Redis Cache Integration', () => {
    it('should build correct campaign cache key', () => {
        expect(buildCampaignsCacheKey('page=1&limit=10')).toBe('cfvn:campaigns:page=1&limit=10');
        expect(buildCampaignsCacheKey('')).toBe('cfvn:campaigns:default');
    });

    it('should have correct stats cache key', () => {
        expect(STATS_CACHE_KEY).toBe('cfvn:stats');
    });

    it('should handle get, set and del without throwing errors', async () => {
        await expect(cacheSet('test:key', { foo: 'bar' }, 60)).resolves.not.toThrow();
        await expect(cacheGet('test:key')).resolves.not.toThrow();
        await expect(cacheDel('test:key')).resolves.not.toThrow();
    });
});
