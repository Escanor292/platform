import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isCertificateCode } from "@/lib/tax/money-flow";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = (searchParams.get("transactionId") || "").trim();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Vui long cung cap ma giao dich hoac ma chung tu" },
        { status: 400 }
      );
    }

    if (isCertificateCode(transactionId)) {
      const certificate = await prisma.donation_certificates.findUnique({
        where: { code: transactionId.toUpperCase() },
        include: {
          pledges: true,
          campaigns: { select: { title: true, slug: true, campaignCode: true, imageUrl: true } },
        },
      });
      if (!certificate) {
        return NextResponse.json({ error: "Khong tim thay chung tu voi ma nay" }, { status: 404 });
      }
      const pledge = certificate.pledges;
      return NextResponse.json({
        pledgeId: pledge.id,
        rewardId: pledge.rewardId,
        transactionId: pledge.transactionId,
        certificateCode: certificate.code,
        documentKind: certificate.documentKind,
        displayName: certificate.displayName,
        amount: pledge.amount,
        tipAmount: pledge.tipAmount,
        vatAmount: pledge.vatAmount,
        totalAmount: pledge.totalAmount,
        paymentProvider: pledge.paymentProvider,
        status: pledge.status,
        refundStatus: pledge.refundStatus,
        createdAt: certificate.issuedAt,
        campaign: certificate.campaigns ? {
          title: certificate.campaigns.title,
          slug: certificate.campaigns.slug,
          campaignCode: certificate.campaigns.campaignCode,
          imageUrl: certificate.campaigns.imageUrl,
        } : null,
      });
    }

    const pledge = await prisma.pledges.findFirst({
      where: {
        OR: [
          { transactionId: transactionId },
          { id: transactionId },
          { payosOrderCode: transactionId }
        ]
      },
      include: {
        campaigns: {
          select: {
            title: true,
            slug: true,
            campaignCode: true,
            imageUrl: true,
          },
        },
        donation_certificate: { select: { code: true, documentKind: true } },
      },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Khong tim thay giao dich nao voi ma nay" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pledgeId: pledge.id,
      rewardId: pledge.rewardId,
      transactionId: pledge.transactionId,
      certificateCode: pledge.donation_certificate?.code || null,
      documentKind: pledge.donation_certificate?.documentKind || null,
      displayName: pledge.isAnonymous ? "Nguoi dung an danh" : (pledge.displayName || "Khach"),
      amount: pledge.amount,
      tipAmount: pledge.tipAmount,
      vatAmount: pledge.vatAmount,
      totalAmount: pledge.totalAmount,
      paymentProvider: pledge.paymentProvider,
      status: pledge.status,
      refundStatus: pledge.refundStatus,
      createdAt: pledge.createdAt,
      campaign: pledge.campaigns ? {
        title: pledge.campaigns.title,
        slug: pledge.campaigns.slug,
        campaignCode: pledge.campaigns.campaignCode,
        imageUrl: pledge.campaigns.imageUrl,
      } : null,
    });
  } catch (error) {
    console.error("[LOOKUP_API]", error);
    return NextResponse.json(
      { error: "Loi he thong trong qua trinh tra cuu" },
      { status: 500 }
    );
  }
}
