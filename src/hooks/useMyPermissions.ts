"use client";

import { useEffect, useState } from "react";
import type { PermissionKey } from "@/lib/permissions-catalog";

export function useMyPermissions() {
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [accountType, setAccountType] = useState<string>("GUEST");

  useEffect(() => {
    fetch("/api/me/permissions")
      .then((res) => res.json())
      .then((data) => {
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
        if (data.accountType) setAccountType(data.accountType);
      })
      .catch(() => undefined);
  }, []);

  return {
    accountType,
    can: (key: PermissionKey) => permissions.includes(key),
    permissions,
  };
}
