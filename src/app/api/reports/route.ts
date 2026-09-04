import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  REPORT_TARGET_LABELS,
  REPORT_TARGET_TYPES,
  parseOccurredAt,
  parseReportImages,
  resolveReportTarget,
  type ReportTargetType,
} from '@/lib/content-report';

const REASONS = new Set(['FRAUD', 'INAPPROPRIATE', 'MISLEADING', 'SCAM', 'INTELLECTUAL_PROPERTY', 'OTHER']);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Bạn cần đăng nhập để gửi báo cáo' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const targetType = body.targetType as ReportTargetType;
  const targetId = typeof body.targetId === 'string' ? body.targetId.trim() : '';
  const reason = typeof body.reason === 'string' ? body.reason : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  if (!REPORT_TARGET_TYPES.includes(targetType) || !targetId) {
    return NextResponse.json({ error: 'Đối tượng báo cáo không hợp lệ' }, { status: 400 });
  }
  if (!REASONS.has(reason) || description.length < 20) {
    return NextResponse.json({ error: 'Vui lòng chọn lý do và mô tả ít nhất 20 ký tự' }, { status: 400 });
  }

  const incident = parseOccurredAt(body.occurredAt);
  if (!incident.ok) {
    return NextResponse.json({ error: 'Thời gian vụ việc không hợp lệ' }, { status: 400 });
  }

  const target = await resolveReportTarget(targetType, targetId);
  if (!target) {
    return NextResponse.json({ error: `Không tìm thấy ${REPORT_TARGET_LABELS[targetType]}` }, { status: 404 });
  }

  const userId = (session.user as any).id;
  const existing = await prisma.campaign_reports.findFirst({
    where: { targetType, targetId: target.targetId, userId },
  });
  if (existing) {
    return NextResponse.json({ error: 'Bạn đã báo cáo mục này rồi' }, { status: 409 });
  }

  const report = await prisma.campaign_reports.create({
    data: {
      id: crypto.randomUUID(),
      campaignId: target.campaignId,
      targetType,
      targetId: target.targetId,
      targetTitle: target.targetTitle,
      targetHref: target.targetHref,
      userId,
      reason,
      description,
      imageUrls: parseReportImages(body.imageUrls),
      occurredAt: incident.value,
      status: 'PENDING',
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ message: 'Báo cáo của bạn đã được gửi thành công', report }, { status: 201 });
}
