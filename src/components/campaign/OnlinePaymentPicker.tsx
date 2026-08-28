"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  CreditCard,
  HelpCircle,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";

export type OnlineChannel = "WALLET" | "CARD" | "NAPAS" | "QR";

export type SavedPaymentMethod = {
  id: string;
  methodType: string;
  provider: string;
  label: string;
  last4: string | null;
  isDefault: boolean;
};

type OnlinePaymentPickerProps = {
  savedMethods: SavedPaymentMethod[];
  isAuthenticated: boolean;
  channel: OnlineChannel;
  selectedPaymentMethodId: string | null;
  savePaymentMethod: boolean;
  amount?: number;
  onChannelChange: (channel: OnlineChannel) => void;
  onSelectSavedMethod: (id: string | null) => void;
  onSavePaymentMethodChange: (value: boolean) => void;
  onMethodLinked?: (method: SavedPaymentMethod) => void;
  persistMethod?: (payload: {
    methodType: string;
    provider: string;
    providerMethodRef: string;
    label: string;
    brand: string | null;
    last4: string;
    isDefault: boolean;
  }) => Promise<SavedPaymentMethod>;
};

const CHANNELS: Array<{ id: OnlineChannel; label: string; hint: string }> = [
  { id: "WALLET", label: "Ví điện tử", hint: "MoMo · ZaloPay · VNPay" },
  { id: "CARD", label: "Thẻ quốc tế", hint: "Visa · Mastercard · JCB" },
  { id: "NAPAS", label: "Thẻ nội địa", hint: "ATM NAPAS · BIN 9704" },
  { id: "QR", label: "VietQR", hint: "Quét, không liên kết" },
];
