import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new NextResponse("Not Found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const amount = searchParams.get("amount");
    const pledgeId = searchParams.get("pledgeId");

    // Lấy thông tin pledge để biết url trả về campaign
    let returnUrl = `${process.env.NEXTAUTH_URL}/campaigns`;

    if (pledgeId) {
        try {
            const pledge = await prisma.pledges.findUnique({
                where: { id: pledgeId },
                include: { campaigns: true }
            });
            if (pledge && pledge.campaigns) {
                returnUrl = `${process.env.NEXTAUTH_URL}/campaigns/${pledge.campaigns.slug}`;
            }
        } catch (e) {
            console.error("Error fetching pledge in mock checkout:", e);
        }
    }

    const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayOS Local Mock Checkout</title>
        <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f4f4f5; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; border-top: 4px solid #3b82f6; }
            .btn { display: inline-block; padding: 12px 24px; color: white; background: #3b82f6; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px; width: 100%; box-sizing: border-box; border: none; cursor: pointer; transition: all 0.2s; }
            .btn:hover { background: #2563eb; }
            .btn:active { transform: scale(0.98); }
            .btn-fail { background: #ef4444; margin-top: 10px; }
            .btn-fail:hover { background: #dc2626; }
            .price { font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0; }
            .fake-tag { display: inline-block; background: #fbbf24; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
            
            /* Modal Styles */
            .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000; opacity: 0; transition: opacity 0.3s; }
            .modal-overlay.show { display: flex; opacity: 1; }
            .modal-content { background: white; padding: 2.5rem 2rem; border-radius: 16px; text-align: center; max-width: 320px; width: 90%; transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .modal-overlay.show .modal-content { transform: scale(1); }
            .success-icon { width: 64px; height: 64px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
            .success-title { margin: 0 0 10px; font-size: 22px; color: #111827; font-weight: 800; }
            .success-desc { color: #6b7280; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
            .btn-success { background: #10b981; }
            .btn-success:hover { background: #059669; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="fake-tag">LOCAL DEV ENVIRONMENT</div>
            <h2>Cổng thanh toán PayOS (MOCK)</h2>
            <p>Order Code: <b>${orderCode}</b></p>
            <div class="price">${Number(amount || 0).toLocaleString('vi-VN')} VND</div>
            
            <div style="background: #fff; padding: 10px; border-radius: 8px; display: inline-block; box-shadow: 0 0 10px rgba(0,0,0,0.05); margin-bottom: 20px;">
                <img src="https://img.vietqr.io/image/970422-0932299701-compact2.png?amount=${amount}&addInfo=${orderCode}&accountName=NGUYEN QUACH PHU TAI" 
                     alt="VietQR Code" 
                     style="width: 250px; height: 250px; border-radius: 4px;" />
            </div>

            <p style="color: #6b7280; font-size: 14px;">Môi trường PayOS đang bị lỗi hoặc bạn đang chạy local dev. Bấm nút dưới đây để giả lập webhook thanh toán thành công.</p>
            
            <button class="btn" onclick="simulatePayment('success')">Chấp nhận thanh toán</button>
            <button class="btn btn-fail" onclick="simulatePayment('failed')">Hủy</button>
        </div>

        <!-- Success Modal -->
        <div id="successModal" class="modal-overlay">
            <div class="modal-content">
                <div class="success-icon">
                    <svg style="width: 36px; height: 36px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="success-title">Thanh toán thành công!</h3>
                <p class="success-desc">Cảm ơn bạn đã đồng hành cùng dự án. Giao dịch đã được xử lý hoàn tất.</p>
                <button class="btn btn-success" onclick="window.location.href='${returnUrl}'">Trở về dự án</button>
            </div>
        </div>

        <script>
            async function simulatePayment(type) {
                const btn = event.target;
                const originalText = btn.innerText;
                btn.innerText = "Đang xử lý...";
                btn.disabled = true;
                
                try {
                    // Gọi test webhook endpoint
                    const res = await fetch('/api/payment/payos/test-webhook?type=' + type + '&orderCode=${orderCode}&amount=${amount}', {
                        method: 'POST'
                    });
                    
                    if (res.ok) {
                        if (type === 'success') {
                            // Hiện modal thành công
                            const modal = document.getElementById('successModal');
                            modal.style.display = 'flex';
                            // Cần một chút delay để transition mượt hơn
                            setTimeout(() => modal.classList.add('show'), 10);
                        } else {
                            alert("Đã hủy thanh toán!");
                            window.location.href = '${returnUrl}';
                        }
                    } else {
                        throw new Error(await res.text());
                    }
                } catch (err) {
                    alert("Lỗi: " + err.message);
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            }
        </script>
    </body>
    </html>
    `;

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

