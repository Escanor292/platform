"use client";

import type { ReactNode } from "react";
import { OwnerViewProvider } from "./OwnerViewContext";
import { OwnerEyeButton } from "./OwnerEyeButton";
import { OwnerRevenuePanel } from "./OwnerRevenuePanel";

export function OwnerPageFrame({
  isOwner,
  kind,
  id,
  children,
}: {
  isOwner: boolean;
  kind: "project" | "campaign" | "product";
  id: string;
  children: ReactNode;
}) {
  return (
    <OwnerViewProvider isOwner={isOwner}>
      {isOwner && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <OwnerRevenuePanel kind={kind} id={id} />
        </div>
      )}
      {children}
      <OwnerEyeButton />
    </OwnerViewProvider>
  );
}
