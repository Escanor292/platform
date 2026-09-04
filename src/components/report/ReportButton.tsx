'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import CampaignReportModal from '@/components/campaign/CampaignReportModal';
import type { ReportTargetType } from '@/lib/content-report';

export default function ReportButton({
  targetType,
  targetId,
  targetTitle,
  className,
  label,
}: {
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || 'inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'}
        title={`Báo cáo ${targetTitle}`}
      >
        <Flag size={16} />
        {label === '' ? null : label || 'Báo cáo'}
      </button>
      <CampaignReportModal
        targetType={targetType}
        targetId={targetId}
        targetTitle={targetTitle}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
