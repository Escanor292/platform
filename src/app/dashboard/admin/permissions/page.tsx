import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";
import { ACCOUNT_TYPES, PERMISSIONS, PERMISSION_GROUPS, getPermissionMap, DEFAULT_PERMISSION_MAP } from "@/lib/permissions";

export default async function AdminPermissionsPage() {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
    redirect("/");
  }
  const map = await getPermissionMap();
  return (
    <div className="min-h-screen bg-slate-50/70 px-6 py-12">
      <div className="mx-auto max-w-[1400px]">
        <PermissionsMatrix
          accountTypes={[...ACCOUNT_TYPES]}
          groups={[...PERMISSION_GROUPS]}
          permissions={[...PERMISSIONS]}
          initialMap={map}
          defaults={DEFAULT_PERMISSION_MAP}
        />
      </div>
    </div>
  );
}
