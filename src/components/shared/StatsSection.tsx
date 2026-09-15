'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';

interface PlatformStats {
  totalFunds: string;
  totalFundsRaw: number;
  successfulCampaigns: number;
  activeCampaigns: number;
  totalBackers: number;
}

export default function StatsSection() {
  const { t, locale } = useI18n();
  const nf = locale === 'en' ? 'en-US' : 'vi-VN';
  const [data, setData] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch('/api/stats', {
          signal: abortController.signal,
          cache: 'no-store'
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const json: PlatformStats = await response.json();
        if (isMounted) setData(json);
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const cards = [
    {
      value: data?.totalFunds ?? '...',
      label: t('stats.funds'),
      trend: data ? t('stats.activeTrend', { n: data.activeCampaigns }) : t('stats.loading'),
      colorClass: 'text-pgreen',
      bgClass: 'from-pgreen/5',
    },
    {
      value: data ? data.successfulCampaigns.toLocaleString(nf) : '...',
      label: t('stats.success'),
      trend: data ? t('stats.doneTrend') : t('stats.loading'),
      colorClass: 'text-tblue',
      bgClass: 'from-tblue/5',
    },
    {
      value: data ? data.totalBackers.toLocaleString(nf) : '...',
      label: t('stats.backers'),
      trend: data ? t('stats.growTrend') : t('stats.loading'),
      colorClass: 'text-dblue',
      bgClass: 'from-dblue/5',
    },
  ];

  return (
    <section className="py-20 px-6 bg-cream relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            {t('stats.title')}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {t('stats.sub')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((stat, index) => (
            <div
              key={`${stat.label}-${index}`}
              className="stat-card glass rounded-3xl p-8 text-center card-hover overflow-hidden relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgClass} to-transparent opacity-0 group-hover:opacity-100 transition duration-500`} />
              <div className="relative z-10">
                <div className={`text-4xl font-display font-extrabold ${stat.colorClass} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                <div className="text-xs text-fgreen mt-2">{stat.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
