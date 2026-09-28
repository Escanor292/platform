import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const BUSINESS_SLIDES_C: PresentationSlide[] = [
{
      kicker: "An toàn thông tin",
      title: "Bảo mật dữ liệu KYC (xác minh cá nhân) / KYB (xác minh doanh nghiệp)",
      body: "CCCD, chân dung, giấy phép, STK (số tài khoản) là dữ liệu nhạy cảm. Chỉ thu tối thiểu để định danh. Không bán, không chia cho bên thứ ba ngoài cổng eKYC (định danh điện tử) và cơ quan khi pháp luật yêu cầu.",
      cards: [
        {
          title: "Đã chạy trên hệ thống",
          body: "eKYC (định danh điện tử): CCCD trước/sau, selfie, liveness (chống ảnh tĩnh), khớp mặt (VNPT / FPT / sandbox). QR CCCD tự điền, không gọi CSDL Bộ Công an. eKYB (xác minh doanh nghiệp) tra MST (mã số thuế) qua VietQR. Đồng ý NĐ 13/2023 trước khi chụp. Ảnh trên Cloudinary; PII (dữ liệu định danh) trên Neon Postgres. HTTPS/TLS trên Vercel. Admin duyệt hồ sơ.",
          tone: "emerald",
        },
        {
          title: "Lộ trình bảo mật",
          body: "Bucket riêng + URL ký hạn ngắn cho ảnh CCCD (hiện upload thư mục dùng chung). Mã hóa field-level AES-256 cho số CCCD / STK (số tài khoản) (hiện plaintext trong kyc_info). Khớp tên chủ TK chi hộ 100% với KYC (xác minh cá nhân) trước khi giải ngân. Nhật ký truy cập hồ sơ nhạy cảm.",
          tone: "rose",
        },
      ],
      paragraphs: [
        {
          lead: "Nguyên tắc",
          text: "Data minimization. Consent trước khi thu. Neon mã hóa đĩa phía nhà cung cấp; đường truyền TLS. Không quảng cáo đã AES-256 từng trường nếu chưa triển khai trong code.",
        },
        {
          lead: "Khớp danh tính",
          text: "Liveness (chống ảnh tĩnh / deepfake). Face-match selfie với CCCD. Chi hộ: tên STK (số tài khoản) creator phải khớp hồ sơ đã xác minh — đây là thiết kế bắt buộc, không phải tùy chọn UX.",
        },
        {
          lead: "Tuân thủ",
          text: "Thiết kế theo Nghị định 13/2023/NĐ-CP (bảo vệ dữ liệu cá nhân). Wizard eKYC (định danh điện tử) ghi rõ ảnh chỉ dùng định danh. Không tự xưng đã đăng ký với Bộ Công an.",
        },
      ],
    },
{
      kicker: "Rủi ro",
      title: "Né P2P (cho vay ngang hàng) chưa phải hết việc — dân sự, thuế, KYC (xác minh cá nhân), KYB (xác minh doanh nghiệp)",
      body: "Phải đăng ký sàn thương mại điện tử với Bộ Công Thương. Tranh chấp không giao hàng là rủi ro dân sự cao. Nhầm quyên góp với doanh thu là rủi ro thuế.",
      table: {
        headers: ["Tiêu chí", "Mức", "Bản chất"],
        rows: [
          [
            "Hạn mức tài chính (P2P — cho vay ngang hàng)",
            "Thấp*",
            "Nếu giữ đúng Donation + Reward pre-order thì không bản chất hóa thành vay / chứng khoán. *Lập luận mô hình, chưa được xác nhận.",
          ],
          [
            "Vận hành TMĐT (thương mại điện tử)",
            "Trung bình",
            "Đăng ký sàn với Bộ Công Thương. Công bố điều khoản, hoàn/giữ, cảnh báo pre-order.",
          ],
          [
            "Dân sự / người tiêu dùng",
            "Cao",
            "Creator không giao. Sàn thiếu cảnh báo hoặc kiểm soát có thể bị kéo vào tranh chấp liên đới.",
          ],
          [
            "Thuế",
            "Trung bình",
            "Nhầm quyên góp với doanh thu. Cá nhân/doanh nghiệp thường nhận Donation có thể bị tính thuế.",
          ],
        ],
      },
      cards: [
        {
          title: "KYB (xác minh doanh nghiệp) — năng lực dự án",
          body: "Giấy tờ pháp nhân thật vẫn vỡ: tính sai chi phí, lỗi hàng, đứt cung ứng. Đánh bóng hồ sơ (ảnh AI, profile mượn) mà sàn duyệt lỏng → rủi ro bị cáo buộc quảng cáo sai sự thật.",
        },
        {
          title: "KYC (xác minh cá nhân) — dòng tiền và mạo danh",
          body: "Ủng hộ / pre-order lớn không khớp chủ ngân hàng: rủi ro rửa tiền. Deepfake mở tài khoản: người bị mạo danh kiện sàn. Giải pháp: đối soát sinh trắc học và khớp tên chủ tài khoản (matching name) với giấy tờ — chống tài khoản rác.",
        },
      ],
    },
{
      kicker: "Mô hình kinh doanh",
      title: "Đa dạng hóa dòng thu nhập",
      body: "Không phụ thuộc một nguồn thu. Reward lấy phí dịch vụ sàn. Donation không chiết khấu khoản ủng hộ — thu từ tip (tiền boa) tự chọn lúc thanh toán. Gói pháp lý / thuế là lộ trình, hợp tác bên thứ ba. Năm đầu giảm tối đa chi phí khởi đầu: hạ tầng free hoặc VPS rẻ, KYC thủ công, không văn phòng — phí 8% và tip chỉ cần nuôi vận hành tối thiểu.",
      table: {
        headers: ["Luồng thu nhập", "Đối tượng", "Cơ chế", "Bản chất"],
        rows: [
          [
            "Phí thương mại (Reward)",
            "Creator",
            "Phí 8% trừ vào số giải ngân khi chiến dịch thành công và đơn đã hoàn tất. Backer trả đúng giá niêm yết.",
            "Phí dịch vụ sàn TMĐT (thương mại điện tử) và escrow (giữ hộ). Không mark-up giá backer.",
          ],
          [
            "Tip tự chọn (Donation)",
            "Backer — Cho đi",
            "Khoản ủng hộ gốc 100% về dự án. Lúc checkout backer chọn 0% hoặc tip (tiền boa, thường 0–15%+). Tip không cộng vào mục tiêu chiến dịch.",
            "Tip thuộc nền tảng. Không phải chiết khấu tiền từ thiện. Đã có trên form ủng hộ.",
          ],
          [
            "Gói hỗ trợ — lộ trình",
            "Creator / doanh nghiệp",
            "VAS (dịch vụ giá trị gia tăng): tư vấn pháp lý, kê khai thuế, đăng ký HKD/DN, đóng gói hồ sơ gọi vốn.",
            "B2B2C (sàn – đối tác – người dùng): liên kết luật sư / kế toán, chia doanh thu. Không tự xưng đã có giấy phép tư vấn.",
          ],
        ],
      },
    },
{
      kicker: "Giữ chân",
      title: "Hệ sinh thái hai chiều — không dùng một lần",
      body: "Không để người dùng rời sau một chiến dịch. Creator giữ tệp khách và công cụ vận hành. Backer có chỗ xác minh, pre-order (đặt trước) giá tốt, và tiền được giữ hộ. Lộ trình đón Chương trình quốc gia 2026–2035: CRM, đóng gói hồ sơ, tập khách đầu — không phải đơn đặt hàng của Bộ.",
      cards: [
        {
          title: "Creator — bệ phóng lập nghiệp",
          body: "CRM (quản lý quan hệ khách hàng): lịch sử backer, tin nhắn, không trôi bài như MXH (mạng xã hội). Đóng gói hồ sơ dự án và tập khách đầu tiên. Bảng tin và bán hàng sau gây quỹ: pre-order xong vẫn cập nhật, chuyển kênh bán. Theo dõi thu-chi dự án. Kết nối tư vấn pháp lý / thuế bên thứ ba là lộ trình — đón chính sách, không over-promise đã được ban ngành đặt hàng.",
          tone: "emerald",
        },
        {
          title: "Backer — trạm dừng an toàn",
          body: "Xác minh eKYC (định danh điện tử) / eKYB (xác minh doanh nghiệp) và thẩm định chiến dịch. Thảo luận công khai, tường người ủng hộ, thông báo tiến độ. Pre-order giá ưu đãi. Escrow (giữ hộ) và hoàn khi trễ SLA (cam kết thời hạn gửi hàng) hoặc miss goal All-or-Nothing.",
          tone: "rose",
        },
      ],
      bullets: [
        "Moat (hào bảo vệ): dữ liệu backer và công cụ thu-chi không có trên Facebook hay Shopee — Creator không bỏ nền tảng sau lần gọi vốn đầu.",
        "Hai phía cùng ở lại: Creator quản lý cộng đồng; backer quay lại vì hồ sơ minh bạch và giá đặt trước.",
        "Không đối đầu sàn lớn — mượn MXH (mạng xã hội) kể chuyện, đưa người về hồ sơ trên Tử Tế Fund.",
      ],
    },
{
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Nơi biến ý tưởng trên giấy thành dự án thật. Cho đi thì có giấy, không bị chiết khấu ẩn. Nhận lại thì có hàng, tiền giữ đến đúng điều kiện. Sàn sống bằng phí Reward, tip tự chọn, và dịch vụ đóng gói — không ăn chặn tiền từ thiện.",
      bullets: [
        "Bệ phóng: điểm đến đầu của người lập nghiệp. Giữ chân bằng CRM (quản lý khách hàng) và hồ sơ, không phải cổng thu tiền một lần.",
        "Hai nhánh, hai chứng từ: Cho đi (Donation) và Nhận lại (Reward) tách minh bạch — không trộn ủng hộ với mua, không biến Reward thành chia lãi.",
        "0% chiết khấu khoản ủng hộ; tip (tiền boa) do backer chọn. Reward: phí 8% trừ payout. Vé/phiếu giải ngân khi chốt; hàng ship khi chốt và nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng) thì hoàn.",
        "Giảm tối đa chi phí khởi đầu: sống được ở quy mô nhỏ, hạ tầng free hoặc VPS rẻ, chưa văn phòng — rồi mới mở đội ngũ.",
        "Tuân thủ: không lấy trần P2P (cho vay ngang hàng) làm giấy thông hành. Vẫn TMĐT (thương mại điện tử), thuế, KYC/KYB (xác minh cá nhân / doanh nghiệp), an toàn dữ liệu.",
        "Đúng hướng chính sách vĩ mô (Chương trình quốc gia KNST 2026–2035): khớp khâu kiểm chứng thị trường. Không tự xưng quỹ nhà nước hay đơn vị được Bộ đặt hàng.",
      ],
    },
{
      kicker: "Phụ lục",
      title: "Luồng người dùng — bốn vai",
      body: "Phụ lục kỹ thuật, tách khỏi mạch thuyết trình. Creator cá nhân hoặc doanh nghiệp. Backer tách Cho đi / Nhận lại. Admin duyệt. Mỗi hàng một người, bước đi từ trên xuống.",
      lanes: [
        {
          title: "Creator — cá nhân hoặc doanh nghiệp",
          tone: "navy",
          steps: [
            "Đăng ký / đăng nhập",
            "eKYC (định danh điện tử) hoặc KYB (xác minh doanh nghiệp, MST — mã số thuế qua VietQR)",
            "Tạo chiến dịch: Donation (cho đi), Reward (nhận lại), hoặc cả hai; chọn AoN (All-or-Nothing — đạt mục tiêu mới giữ) / KiA (Keep-It-All — giữ kể cả chưa đạt)",
            "Nhận ủng hộ / đơn — tiền đang giữ, chưa về STK (số tài khoản) creator",
            "Reward: gửi ĐVVC (đơn vị vận chuyển) hoặc mở nhận tại chỗ đúng SLA (cam kết thời hạn gửi hàng = ngày hẹn + 2 ngày)",
            "Chi hộ từng đơn khi chiến dịch đã chốt và khách đã nhận đủ",
          ],
        },
        {
          title: "Backer — Cho đi (Donation / quyên góp)",
          tone: "rose",
          steps: [
            "Vào hồ sơ chiến dịch (có thể từ MXH — mạng xã hội)",
            "Ủng hộ, không chọn quà",
            "Chọn kênh trên màn, chuyển khoản STK trung gian, đối soát SUCCESS",
            "Đối soát SUCCESS. Khách: TT-UH gửi Gmail. Đã login: Gmail và Kho đồ",
            "Giải ngân khi chốt chiến dịch (AoN đạt mục tiêu, hoặc KiA)",
          ],
        },
        {
          title: "Backer — Nhận lại (Reward / đặt trước)",
          tone: "emerald",
          steps: [
            "Chọn combo / vé / pre-order (đặt trước)",
            "Thanh toán — tiền giữ theo đơn (escrow — giữ hộ)",
            "Biên lai INV- + phiếu/sản phẩm trong Kho đồ",
            "Phiếu/sản phẩm: đã có trong Kho đồ = đã nhận quà. Hàng ship: xác nhận hoặc 7 ngày không khiếu nại",
            "Phiếu/sản phẩm: giải ngân khi chốt chiến dịch. Hàng ship: chốt + đã nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng, hàng vật lý) → hoàn đơn",
          ],
        },
        {
          title: "Admin (quản trị)",
          steps: [
            "Duyệt KYC (xác minh cá nhân) / chiến dịch / kiểm duyệt",
            "Theo dõi SLA (cam kết thời hạn gửi hàng), hoàn trễ, khóa nội dung",
            "Mở thuyết trình nội bộ (nút xanh dashboard)",
          ],
        },
      ],
    },
{
      kicker: "Phụ lục",
      title: "Schema lõi — Neon Postgres",
      body: "Phụ lục kỹ thuật. Không vẽ hết 50+ bảng. Chỉ vòng gây quỹ lai: người → chiến dịch → đơn → chứng từ. Chat/blog nằm Mongo hoặc bảng phụ, không đi vào escrow (giữ hộ tiền).",
      schema: [
        {
          title: "Định danh",
          items: [
            "users (vai trò, STK — số tài khoản nhận chi hộ)",
            "kyc_info (CCCD, selfie, ekycMeta, consentAt — đồng ý NĐ 13)",
            "transaction_limits (hạn mức giao dịch)",
          ],
        },
        {
          title: "Hồ sơ dự án",
          items: [
            "projects → campaigns",
            "campaigns.type Donation (cho đi) | Reward (nhận lại)",
            "campaigns.fundingModel AoN (đạt mới giữ) | KiA (giữ cả khi chưa đạt)",
            "rewards (giao hàng, SLA — cam kết thời hạn gửi hàng)",
          ],
        },
        {
          title: "Dòng tiền / đơn",
          items: [
            "pledges.status PENDING (chờ) → SUCCESS (đã giữ) → RELEASED (đã chi) | REFUNDED (đã hoàn)",
            "pledges.fulfillmentStatus, handedToCarrierAt (giao ĐVVC), receivedAt (đã nhận)",
            "pledges.platformFee (phí sàn ~8%)",
            "checkout_sessions, payment_methods",
          ],
        },
        {
          title: "Chứng từ",
          items: [
            "donation_certificates (mã TT-UH — chứng nhận ủng hộ)",
            "backer_invoices (mã INV- — biên lai nội bộ)",
            "reward_digital_assets / Kho đồ",
            "platform_invoices (hóa đơn phí sàn)",
          ],
        },
      ],
    },
{
      kicker: "Phụ lục",
      title: "src/lib",
      body: "Phụ lục kỹ thuật. App Router nằm src/app. Dưới đây là thư viện lõi của mô hình lai. Tên file đúng repo.",
      tree: [
        { path: "src/lib/payment/", note: "tạo đơn BANK_ESCROW, bốn kênh trên màn, chuyển khoản STK trung gian, đối soát, hoàn" },
        { path: "src/lib/tax/", note: "giấy TT-UH (chứng nhận ủng hộ), sổ, khi pledges SUCCESS" },
        { path: "src/lib/ekyc/", note: "định danh điện tử VNPT/FPT, QR CCCD, KYB (xác minh doanh nghiệp) MST (mã số thuế)" },
        { path: "src/lib/campaign/", note: "tạo/sửa chiến dịch, đổi mô hình gây quỹ" },
        { path: "src/lib/funding-model.ts", note: "AoN (đạt mới giữ) / KiA (giữ cả khi chưa đạt)" },
        { path: "src/lib/campaign-lifecycle.ts", note: "đóng hạn, chốt chiến dịch" },
        { path: "src/lib/order-fulfillment.ts", note: "đang xử lý → gửi / nhận" },
        { path: "src/lib/ship-sla.ts", note: "SLA (cam kết thời hạn gửi hàng) = ngày hẹn + 2 ngày" },
        { path: "src/lib/money-buckets.ts", note: "ngăn giữ / chi hộ / hoàn" },
        { path: "src/lib/digital-warehouse.ts", note: "Kho đồ backer" },
        { path: "src/lib/prisma.ts · mongodb.ts · redis.ts", note: "Neon Postgres, chat Mongo, cache Redis" },
      ],
    },
{
      variant: "pnl",
      kicker: "P&L",
      title: "Doanh thu và chi phí — tích để xem",
      body: "Nguyên tắc năm đầu: giảm tối đa chi phí khởi đầu — ưu tiên gói free hoặc VPS rẻ, bản KYC thủ công, không văn phòng, không ads lớn. Chỉ bật khoản tùy chọn khi đã có giao dịch. Tích đủ doanh thu, một hạ tầng và một bản vận hành thì bảng quý/năm hiện ở cuối.",
    },
];
