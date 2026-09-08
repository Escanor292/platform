import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PolicyShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 pb-32 md:pb-16 min-h-screen">
      <Link
        href="/policy"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pgreen mb-8 transition"
      >
        <ArrowLeft size={16} />
        Trung tâm chính sách
      </Link>

      <div className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-gray-500 text-lg leading-relaxed">{subtitle}</p>
        ) : null}
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

export function PolicyCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
      <h2 className="text-xl font-black text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3 text-sm md:text-base">{children}</div>
    </section>
  );
}
