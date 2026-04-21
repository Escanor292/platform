import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return new NextResponse("Not Found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get("orderCode");
    const amount = searchParams.get("amount");
    const pledgeId = searchParams.get("pledgeId");
    const returnUrl = searchParams.get("returnUrl") || `${process.env.NEXTAUTH_URL}/payment-success?status=success&ref=${pledgeId}`;

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
            .btn { display: inline-block; padding: 12px 24px; color: white; background: #3b82f6; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 20px; width: 100%; box-sizing: border-box; border: none; cursor: pointer; }
            .btn-fail { background: #ef4444; margin-top: 10px; }
            .price { font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0; }
            .fake-tag { display: inline-block; background: #fbbf24; color: #b45309; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
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

        <script>
            async function simulatePayment(type) {
                const btn = event.target;
                btn.innerText = "Đang xử lý...";
                btn.disabled = true;
                
                try {
                    // Gọi test webhook endpoint
                    const res = await fetch('/api/payment/payos/test-webhook?type=' + type + '&orderCode=${orderCode}&amount=${amount}', {
                        method: 'POST'
                    });
                    
                    if (res.ok) {
                        alert("Mô phỏng webhook " + type + " thành công! Đang chuyển hướng...");
                        window.location.href = '${returnUrl}';
                    } else {
                        throw new Error(await res.text());
                    }
                } catch (err) {
                    alert("Lỗi: " + err.message);
                    btn.innerText = "Thử lại";
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
