"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail } from "lucide-react";
import LeafIcon from "./LeafIcon";
import BrandMark from "@/components/layout/BrandMark";
import { useI18n } from "@/i18n";

export default function FooterNew() {
  const { t } = useI18n();

  return (
    <footer
      id="ho-tro"
      className="bg-dblue px-4 py-8 pb-24 text-white transition-colors duration-300 sm:px-6 md:py-12 md:pb-12 dark:bg-gray-900"
      style={{ backgroundColor: "var(--profile-shell-primary, #1F4E79)", color: "var(--profile-contrast, #ffffff)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center ring-1 ring-white/20">
              <LeafIcon className="w-5 h-5" />
            </div>
            <BrandMark className="font-display text-lg font-bold" />
          </div>
          <p className="text-sm leading-relaxed opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">{t("footer.explore")}</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            <Link href="/campaigns" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.campaigns")}
            </Link>
            <Link href="/gioi-thieu" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.about")}
            </Link>
            <Link href="/lookup" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.lookup")}
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">{t("footer.support")}</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            <Link href="/huong-dan/creator" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.creatorGuide")}
            </Link>
            <Link href="/upgrade" className="block cursor-pointer transition hover:opacity-100">
              {t("nav.upgrade")}
            </Link>
            <Link href="/policy/terms" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.terms")}
            </Link>
            <Link href="/policy/privacy" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.privacy")}
            </Link>
            <Link href="/huong-dan/thue" className="block cursor-pointer transition hover:opacity-100">
              {t("footer.taxGuide")}
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">{t("footer.contact")}</h4>
          <div className="space-y-2 text-sm opacity-60" style={{ color: "var(--profile-contrast, #ffffff)" }}>
            <p>hello@tutefund.vn</p>
            <div className="flex gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs opacity-40" style={{ color: "var(--profile-contrast, #ffffff)" }}>
        {t("footer.rights", { brand: t("brand.name") })}
      </div>
    </footer>
  );
}
