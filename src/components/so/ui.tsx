import type { ReactNode } from "react";

export function Panel({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          {hint ? <p className="mt-1 max-w-2xl text-sm text-muted">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-sm text-navy">{hint}</p> : null}
    </div>
  );
}

const tones = {
  green: "bg-pgreen/10 text-pgreen",
  navy: "bg-navy/10 text-navy",
  brown: "bg-ebrown/10 text-ebrown",
  danger: "bg-danger/10 text-danger",
  mute: "bg-cream text-muted",
} as const;

export function Pill({ children, tone = "mute" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  kind = "green",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "green" | "navy" | "ghost" | "danger";
  type?: "button" | "submit";
}) {
  const cls =
    kind === "green"
      ? "bg-pgreen text-surface"
      : kind === "navy"
        ? "bg-navy text-surface"
        : kind === "danger"
          ? "bg-surface text-danger border border-danger/30"
          : "bg-surface text-ink border border-line";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${cls}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-2xl border border-line bg-cream px-3 text-ink outline-none focus:border-pgreen"
      />
    </label>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-cream px-4 py-6 text-sm text-muted">{text}</p>;
}
