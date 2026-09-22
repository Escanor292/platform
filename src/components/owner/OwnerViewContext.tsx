"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type OwnerViewState = {
  isOwner: boolean;
  guestPreview: boolean;
  showOwnerUi: boolean;
  toggleGuestPreview: () => void;
};

const OwnerViewContext = createContext<OwnerViewState | null>(null);

export function OwnerViewProvider({
  isOwner,
  children,
}: {
  isOwner: boolean;
  children: ReactNode;
}) {
  const [guestPreview, setGuestPreview] = useState(false);
  const value = useMemo<OwnerViewState>(
    () => ({
      isOwner,
      guestPreview: isOwner ? guestPreview : false,
      showOwnerUi: isOwner && !guestPreview,
      toggleGuestPreview: () => setGuestPreview((current) => !current),
    }),
    [guestPreview, isOwner],
  );

  return <OwnerViewContext.Provider value={value}>{children}</OwnerViewContext.Provider>;
}

export function useOwnerView(): OwnerViewState {
  return useContext(OwnerViewContext) ?? {
    isOwner: false,
    guestPreview: false,
    showOwnerUi: false,
    toggleGuestPreview: () => undefined,
  };
}

export function OwnerOnly({ children }: { children: ReactNode }) {
  const { showOwnerUi } = useOwnerView();
  if (!showOwnerUi) return null;
  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { showOwnerUi } = useOwnerView();
  if (showOwnerUi) return null;
  return <>{children}</>;
}
