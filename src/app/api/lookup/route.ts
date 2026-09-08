import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isCertificateCode } from "@/lib/tax/money-flow";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = (searchParams.get("transactionId") || "").trim();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp mã giao dịch hoặc mã chứng từ" },
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
        return NextResponse.json({ error: "Không tìm thấy chứng từ với mã này" }, { status: 404 });
      }
      const pledge = certificate.pledges;
      return NextResponse.json({
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
        { error: "Không tìm thấy giao dịch nào với mã này" },
        { status: 404 }
      );
    }

    const safeData = {
      transactionId: pledge.transactionId,
      certificateCode: pledge.donation_certificate?.code || null,
      documentKind: pledge.donation_certificate?.documentKind || null,
      displayName: pledge.isAnonymous ? "Người dùng ẩn danh" : (pledge.displayName || "Khách"),
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
    };

    return NextResponse.json(safeData);
  } catch (error) {
    console.error("[LOOKUP_API]", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống trong quá trình tra cứu" },
      { status: 500 }
    );
  }
}
