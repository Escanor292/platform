import { redirect } from "next/navigation";
import HybridModelPresentation from "@/components/admin/HybridModelPresentation";
import { getActivePresentationDeck } from "@/lib/admin-presentation";

export const dynamic = "force-dynamic";

export default async function AdminThuyetTrinhPage() {
  const deck = await getActivePresentationDeck();
  if (!deck) redirect("/dashboard/admin");
  return <HybridModelPresentation deck={deck} />;
}
