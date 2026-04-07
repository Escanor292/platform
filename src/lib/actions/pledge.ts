"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createPledgeAction(formData: FormData) {
  const session = await auth();
  const campaignId = formData.get("campaignId") as string;
  const amount = Number(formData.get("amount"));
  const isAnonymous = formData.get("isAnonymous") === "on";
  const displayName = formData.get("displayName") as string;

  if (!campaignId || !amount || amount < 10000) {
    throw new Error("Dữ liệu không hợp lệ");
  }

  // Trong thực tế, đây sẽ là nơi gọi API thanh toán (VNPay/MoMo/PayOS)
  // Ở đây chúng ta giả lập tạo một Pledge PENDING và chuyển hướng tới trang chọn phương thức
  
  const pledge = await prisma.pledge.create({
    data: {
      campaignId,
      userId: session?.user?.id || null,
      amount,
      totalAmount: amount, // Đơn giản hóa cho action này
      displayName: isAnonymous ? "Người dùng ẩn danh" : (displayName || session?.user?.name || "Người ủng hộ"),
      isAnonymous,
      paymentProvider: "VNPAY", // Default chosen for demo
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status: "PENDING",
    },
  });

  // Chuyển hướng tới trang thanh toán (giả định có route xử lý payment)
  redirect(`/checkout/${pledge.id}`);
}
