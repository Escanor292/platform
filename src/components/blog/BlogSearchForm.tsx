"use client";

import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useI18n, type MessageKey } from "@/i18n";

const SORTS: { value: string; key: MessageKey }[] = [
  { value: "latest", key: "sort.newest" },
  { value: "popular", key: "sort.rated" },
  { value: "most_viewed", key: "sort.viewed" },
];

const TYPES: { value: string; key: MessageKey }[] = [
  { value: "", key: "catalog.all" },
  { value: "PLATFORM", key: "blog.typeNews" },
  { value: "CAMPAIGN_UPDATE", key: "blog.typeUpdate" },
  { value: "STORY", key: "blog.typeStory" },
];

function blogHref(search: string, type?: string, sort?: string) {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  if (type) query.set("type", type);
  if (sort && sort !== "latest") query.set("sort", sort);
  const qs = query.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

function Dropdown({
  label,
  icon,
  open,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-[100]">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 w-full items-center gap-2 whitespace-nowrap rounded-xl border-2 border-pgreen/20 bg-white px-4 font-bold text-dblue transition-colors hover:border-pgreen/40 hover:text-pgreen md:w-auto md:px-6"
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[999] mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-pgreen/20 bg-white shadow-2xl">
          {children}
        </div>
      )}
    </div>
  );
}

export function BlogSearchForm({
  defaultSearch = "",
  type,
  sort = "latest",
}: {
  defaultSearch?: string;
  type?: string;
  sort?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState(defaultSearch);
  const [openSort, setOpenSort] = useState(false);
  const [openType, setOpenType] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setValue(defaultSearch), [defaultSearch]);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenSort(false);
        setOpenType(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (next: { search?: string; type?: string; sort?: string }) => {
    router.push(blogHref(next.search ?? value, next.type === undefined ? type : next.type, next.sort ?? sort));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    go({ search: value });
  };

  const sortLabel = t(SORTS.find((item) => item.value === sort)?.key || "sort.newest");
  const typeItem = TYPES.find((item) => item.value === (type || ""));
  const typeLabel = typeItem ? t(typeItem.key) : t("catalog.filters");
  const hasFilters = Boolean(value.trim() || type || (sort && sort !== "latest"));

  return (
    <div ref={rootRef} className="relative z-40 mx-auto max-w-4xl overflow-visible">
      <div className="glass rounded-3xl p-5 shadow-soft md:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t("blog.searchPlaceholder")}
              className="h-16 w-full rounded-2xl border-2 border-pgreen/20 pl-16 pr-14 text-lg font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-pgreen focus:ring-2 focus:ring-pgreen/20"
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  go({ search: "" });
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-pgreen"
                aria-label={t("catalog.clearFilters")}
              >
                <X size={22} />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Dropdown
              label={sortLabel}
              icon={<ArrowUpDown size={18} className="text-gray-400" />}
              open={openSort}
              onToggle={() => {
                setOpenSort((v) => !v);
                setOpenType(false);
              }}
            >
              {SORTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setOpenSort(false);
                    go({ sort: item.value });
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium ${
                    item.value === (sort || "latest") ? "bg-pgreen text-white" : "text-dblue hover:bg-pgreen/10 hover:text-pgreen"
                  }`}
                >
                  {t(item.key)}
                </button>
              ))}
            </Dropdown>
            <Dropdown
              label={type ? typeLabel : t("catalog.filters")}
              icon={<SlidersHorizontal size={18} />}
              open={openType}
              onToggle={() => {
                setOpenType((v) => !v);
                setOpenSort(false);
              }}
            >
              {TYPES.map((item) => (
                <button
                  key={item.value || "all"}
                  type="button"
                  onClick={() => {
                    setOpenType(false);
                    go({ type: item.value });
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium ${
                    (type || "") === item.value ? "bg-pgreen text-white" : "text-dblue hover:bg-pgreen/10 hover:text-pgreen"
                  }`}
                >
                  {t(item.key)}
                </button>
              ))}
            </Dropdown>
          </div>
        </form>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {value.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pgreen/10 px-3 py-1 text-xs font-bold text-pgreen">
                “{value.trim()}”
                <button type="button" onClick={() => { setValue(""); go({ search: "" }); }} aria-label={t("catalog.clearFilters")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pgreen/10 px-3 py-1 text-xs font-bold text-pgreen">
                {typeLabel}
                <button type="button" onClick={() => go({ type: "" })} aria-label={t("catalog.clearFilters")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {sort && sort !== "latest" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pgreen/10 px-3 py-1 text-xs font-bold text-pgreen">
                {sortLabel}
                <button type="button" onClick={() => go({ sort: "latest" })} aria-label={t("catalog.clearFilters")}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button type="button" onClick={() => { setValue(""); router.push("/blog"); }} className="text-xs font-bold text-gray-500 hover:text-pgreen">
              {t("blog.clearAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
