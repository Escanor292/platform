import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TransactionStatement from "@/components/campaign/TransactionStatement";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type Params = { params: Promise<{ campaignId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { campaignId } = await params;

  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
    select: { title: true, campaignCode: true }
  });

  return {
    title: `Báo cáo giao dịch - ${campaign?.title || 'Chiến dịch'}`,
    description: `Báo cáo chi tiết các giao dịch ủng hộ cho chiến dịch ${campaign?.title || ''}`
  };
}

export default async function StatementPage({ params }: Params) {
  const { campaignId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const campaign = await prisma.campaigns.findUnique({
    where: { id: campaignId },
    include: {
      pledges: {
        orderBy: { createdAt: "desc" },
        include: {
          users: {
            select: { name: true }
          },
          rewards: {
            select: { title: true }
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
            goalAmount: Number(campaign.goalAmount),
            closedAmount: campaign.closedAmount == null ? null : Number(campaign.closedAmount),
            closedAt: campaign.closedAt
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
            status: p.status,
            refundStatus: p.refundStatus,
            fulfillmentStatus: p.fulfillmentStatus,
            accountingReversedAt: p.accountingReversedAt,
            depositAmount: Number(p.depositAmount),
            chargeAmount: Number(p.chargeAmount),
            orderTotalAmount: Number(p.orderTotalAmount),
            paidAmount: Number(p.paidAmount),
            remainingAmount: Number(p.remainingAmount),
            accountingAmount: Number(p.accountingAmount),
            refundAmount: Number(p.refundAmount),
            cancellationFeeAmount: Number(p.cancellationFeeAmount),
            isCashOnDelivery: p.isCashOnDelivery,
            reversalReason: p.fulfillmentStatus === "DELIVERY_FAILED"
              ? (p.deliveryFailureReason || "Giao hàng không thành công")
              : p.fulfillmentStatus === "CANCELED"
                ? (p.cancellationReason || "Hủy đơn hàng")
                : p.fulfillmentStatus === "RETURNED"
                  ? (p.returnReason || "Trả hàng")
                  : null,
            rewardTitle: p.rewards?.title || null,
            user: p.users
          }))}
        />
      </div>
    </div>
  );
}
