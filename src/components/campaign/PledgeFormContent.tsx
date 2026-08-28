"use client";

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatVND } from "@/lib/utils";
import OnlinePaymentPicker, { type OnlineChannel } from "@/components/campaign/OnlinePaymentPicker";

export default function PlaceholderRestore() {
  return null;
}
