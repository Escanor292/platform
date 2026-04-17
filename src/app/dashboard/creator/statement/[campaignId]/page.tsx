import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TransactionStatement from "@/components/campaign/TransactionStatement";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Params = { params: Promise<{ campaignId: string }> };

export default async function StatementPage({ params }: Params) {
  const { campaignId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      pledges: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!campaign) {
    return notFound();
  }

  // Check if user is the creator
  if (campaign.creatorId !== (session.user as any).id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Link 
          href="/dashboard/creator"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition print:hidden"
        >
          <ArrowLeft size={16} />
          Quay lại Dashboard
        </Link>

        {/* Statement Component */}
        <TransactionStatement 
          campaign={{
            id: campaign.id,
            title: campaign.title,
            campaignCode: campaign.campaignCode,
            currentAmount: Number(campaign.currentAmount),
            goalAmount: Number(campaign.goalAmount)
          }}
          pledges={campaign.pledges.map(p => ({
            id: p.id,
            amount: Number(p.amount),
            totalAmount: Number(p.totalAmount),
            displayName: p.displayName,
            isAnonymous: p.isAnonymous,
            createdAt: p.createdAt,
            transactionId: p.transactionId,
            paymentProvider: p.paymentProvider,
            user: p.user
          }))}
        />
      </div>
    </div>
  );
}
