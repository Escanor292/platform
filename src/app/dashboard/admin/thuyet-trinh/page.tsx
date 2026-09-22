import { redirect } from "next/navigation";
import HybridModelPresentation from "@/components/admin/HybridModelPresentation";
import { getActivePresentationDeck } from "@/lib/admin-presentation";
import { getPresentationLiveStats } from "@/lib/admin-presentation-live-stats";

export const dynamic = "force-dynamic";

export default async function AdminThuyetTrinhPage() {
  const deck = await getActivePresentationDeck();
  if (!deck) redirect("/dashboard/admin");
  let liveStats = null;
  try {
    liveStats = await getPresentationLiveStats();
  } catch (error) {
    console.warn("[PRESENTATION LIVE STATS]", error);
  }
  return <HybridModelPresentation deck={deck} liveStats={liveStats} />;
}