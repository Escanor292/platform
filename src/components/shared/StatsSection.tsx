'use client';

import { useEffect, useState, useRef } from 'react';

interface PlatformStats {
  totalFunds: string;
  totalFundsRaw: number;
  successfulCampaigns: number;
  activeCampaigns: number;
  totalBackers: number;
  transparencyRate: string;
  transparencyRateRaw: number;
}

export default function StatsSection() {
  const [stats, setStats] = useState([
    { value: '...', label: 'Tổng tiền gây quỹ', trend: 'Đang tải...', colorClass: 'text-pgreen', bgClass: 'from-pgreen/5' },
    { value: '...', label: 'Chiến dịch thành công', trend: 'Đang tải...', colorClass: 'text-tblue', bgClass: 'from-tblue/5' },
    { value: '...', label: 'Người ủng hộ', trend: 'Đang tải...', colorClass: 'text-dblue', bgClass: 'from-dblue/5' },
    { value: '...', label: 'Tỷ lệ minh bạch', trend: 'Zero hidden fees', colorClass: 'text-ebrown', bgClass: 'from-ebrown/5' },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function fetchStats() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats', {
          signal: abortController.signal,
          cache: 'no-store'
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data: PlatformStats = await response.json();

        if (isMounted) {
          setStats([
            {
              value: data.totalFunds,
              label: 'Tổng tiền gây quỹ',
              trend: `${data.activeCampaigns} chiến dịch đang hoạt động`,
              colorClass: 'text-pgreen',
              bgClass: 'from-pgreen/5'
            },
            {
              value: data.successfulCampaigns.toLocaleString('vi-VN'),
              label: 'Chiến dịch thành công',
              trend: 'Đã hoàn thành mục tiêu',
              colorClass: 'text-tblue',
              bgClass: 'from-tblue/5'
            },
            {
              value: data.totalBackers.toLocaleString('vi-VN'),
              label: 'Người ủng hộ',
              trend: 'Cộng đồng đang phát triển',
              colorClass: 'text-dblue',
              bgClass: 'from-dblue/5'
            },
            {
              value: data.transparencyRate,
              label: 'Tỷ lệ minh bạch',
              trend: 'Zero hidden fees',
              colorClass: 'text-ebrown',
              bgClass: 'from-ebrown/5'
            },
          ]);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching stats:', error);
        if (isMounted) setIsLoading(false);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <section className="py-20 px-6 bg-cream relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-dblue mb-3">
            Sức mạnh cộng đồng trong con số
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Những thống kê thực tế từ hành trình của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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