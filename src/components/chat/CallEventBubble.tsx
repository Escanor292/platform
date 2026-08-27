'use client';

import { PhoneOff } from 'lucide-react';
import { getCallEventView } from '@/lib/chat-call-preview';
import { cn } from '@/lib/utils';

export function CallEventBubble({
  text,
  align = 'right',
}: {
  text: string;
  align?: 'left' | 'right';
}) {
  const view = getCallEventView(text);
  if (!view) return null;

  return (
    <div className={cn('flex w-full', align === 'right' ? 'justify-end' : 'justify-start')}>
      <div className="inline-flex items-center gap-3 rounded-[22px] bg-gray-100 px-3.5 py-2.5 text-gray-800 shadow-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
          <PhoneOff className="h-4 w-4" />
        </span>
        <div className="leading-tight pr-1">
          <div className="text-sm font-semibold text-gray-900">{view.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{view.subtitle}</div>
        </div>
      </div>
    </div>
  );
}
