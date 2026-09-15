import type { PresentationDeck } from "@/lib/admin-presentation-types";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 10;

export const PRESENTATION_MEDIA_FILES = [
  "chung-nhan-tt-uh.jpg",
  "bien-lai-thanh-toan.jpg",
  "donation-reward.jpg",
  "ga-ran-truyen-thong.jpg",
  "ga-ran-nen-tang.jpg",
  "ban-do-quy-mo.jpg",
  "kho-do.jpg",
  "ve-uu-dai.jpg",
] as const;

export const DEFAULT_PRESENTATION_DECK: PresentationDeck = {
  version: PRESENTATION_SEED_VERSION,
  brand: "Tử Tế Fund · Thuyết trình nội bộ",
  title: "Mô hình lai Donation + Reward",
  slides: [
    {
      variant: "hero",
      kicker: "Bảo vệ đồ án · Tử Tế Fund",
      title: "Nền tảng gây quỹ lai",
      titleAccent: "Cho đi và Nhận lại",
      body: "Nơi để bắt đầu hành trình: gây quỹ nhân đạo, đặt trước sản phẩm, và lưu hồ sơ dự án.",
      cards: [
        {
          title: "Cho đi (Donation)",
          body: "Ủng hộ vì mục đích nhân đạo. Không nhận lại lợi ích tài chính hay vật chất lớn. Đầu ra: giấy chứng nhận ủng hộ. Giải ngân sau khi chốt chiến dịch, theo All-or-Nothing hoặc Keep-It-All.",
          tone: "rose",
        },
        {
          title: "Nhận lại (Reward)",
          body: "Hàng mẫu, combo, pre-order. Có biên lai. Hoàn nếu trễ SLA gửi hàng hoặc khách không nhận đủ. Chỉ giải ngân từng đơn khi chiến dịch đã chốt và đơn đó đã nhận đủ hàng.",
          tone: "emerald",
        },
      ],
    },
    {
      kicker: "Thị trường",
      title: "Khoảng trống thị trường crowdfunding",
      body: "Không thay Facebook, không đánh Shopee. Tử Tế Fund giữ hồ sơ chiến dịch, dòng tiền đối soát và chứng từ nội địa — mượn MXH kể chuyện rồi đưa người về đây.",
      table: {
        headers: ["Nền tảng", "Mốc / quy mô", "Điểm mạnh", "Điểm yếu", "Tử Tế Fund"],
        rows: [
          [
            "Kickstarter / Indiegogo",
            "2008–2009. Reward toàn cầu.",
            "Cộng đồng lớn. Pre-order / Reward chuẩn. Indiegogo có Keep-It-All.",
            "Thanh toán quốc tế. Không chứng từ / pháp lý nội địa VN.",
            "VietQR / PayOS. Giấy TT-UH và biên lai INV-. AoN và KiA trên cùng nền tảng.",
          ],
          [
            "GoFundMe",
            "2010. Chuyên donation.",
            "Kêu gọi hoàn cảnh, cá nhân, dễ ủng hộ.",
            "Yếu Reward. Minh bạch giải ngân hạn chế. Không hồ sơ giao hàng.",
            "Hai nhánh trên một chiến dịch. Donation giải ngân khi chốt; Reward khóa theo đơn.",
          ],
          [
            "Facebook / Zalo / ví",
            "Kênh phổ biến tại VN.",
            "Lan tỏa nhanh. Thanh toán 1 chạm.",
            "Trôi bài. Không SLA giao. Không chứng từ, không nhật ký dự án.",
            "Mượn MXH dẫn về hồ sơ chiến dịch tập trung. Giữ tiền, hoàn, kho đồ.",
          ],
          [
            "Shopee / Lazada",
            "Sàn TMĐT SKU có sẵn.",
            "Logistic, đánh giá, traffic mua sắm.",
            "Không gây quỹ lai. Pre-order dễ trộn với hàng có sẵn. Không giấy ủng hộ.",
            "Không đối đầu logistic. Reward = đặt trước có SLA; Donation tách pháp lý.",
          ],
        ],
      },
      note: "Năm ra mắt là mốc công khai của từng nền tảng, không phải số liệu nội bộ. Tử Tế Fund không thay bảng tin MXH và không thay sàn bán SKU.",
    },
    {
      kicker: "Khách hàng nhắm đến",
      title: "Chân dung người dùng — Creator và Backer",
      body: "Hai phía, hai nhu cầu. Creator cần cộng đồng và đặt trước để kiểm chứng thị trường. Backer cần minh bạch khi cho đi, và khóa hoàn khi nhận lại.",
      cards: [
        {
          title: "Creator",
          body: "Người mở nghề nhỏ, nhượng quyền F&B, thủ công, khóa học, sản phẩm sáng tạo. Cần pre-order để biết nhập bao nhiêu, cộng đồng đồng hành — không chỉ một đơn rời trên Shopee.",
        },
        {
          title: "Backer — Cho đi",
          body: "Ủng hộ nhân đạo hoặc nâng đỡ quán / dự án, không lấy hàng. Cần minh bạch và giấy chứng nhận TT-UH để lưu, không biến khoản ủng hộ thành đơn hàng giả.",
          tone: "rose",
        },
        {
          title: "Backer — Nhận lại",
          body: "Muốn trải nghiệm sớm, combo, vé, pre-order. Sợ bùng hàng. Cần giữ tiền, SLA gửi hàng, hoàn nếu trễ hoặc không nhận đủ.",
          tone: "emerald",
        },
      ],
    },
    {
      kicker: "Mô hình lai",
      title: "Hai nhánh, hai loại chứng từ",
      body: "Cùng một chiến dịch có thể mở cả ủng hộ không nhận quà và đặt hàng. Pháp lý và đầu ra tách rõ — không trộn “ủng hộ” với “mua”.",
      cards: [
        {
          title: "Từ thiện / Quyên góp",
          body: "Cho đi. Không cổ phần, không lợi nhuận. Sau đối soát: giấy chứng nhận TT-UH. Không phải hóa đơn GTGT.",
          tone: "rose",
        },
        {
          title: "Nhận quà tri ân (Reward)",
          body: "Giao dịch có hàng: sẵn kho, nhận tại chỗ, hoặc pre-order. Biên lai INV- nội bộ. Hóa đơn GTGT (nếu cần) do creator xuất với tư cách người bán.",
          tone: "emerald",
        },
      ],
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Mẫu giấy chứng nhận ủng hộ TT-UH",
          caption: "Mẫu giao diện giấy chứng nhận Donation. Không phải chứng từ đã cấp cho một giao dịch thật.",
        },
        {
          key: "bien-lai-thanh-toan.jpg",
          alt: "Mẫu biên lai thanh toán Reward",
          caption: "Mẫu biên lai INV- của hệ thống. Chứng từ đối chiếu, không phải hóa đơn GTGT.",
        },
      ],
    },
    {
      kicker: "Giữ tiền và hoàn tiền",
      title: "All-or-Nothing và Keep-It-All",
      body: "Tiền không về creator lúc thanh toán. Reward giải ngân theo từng đơn — không treo cả chiến dịch vì một người chưa nhận. Mỗi đơn chỉ giải ngân khi chiến dịch đã chốt và đơn đó đã nhận đủ hàng.",
      table: {
        headers: ["Mô hình", "Donation (không quà)", "Reward (có giao / nhận tại chỗ)"],
        rows: [
          [
            "All-or-Nothing",
            "Hết hạn không đạt mục tiêu → hoàn toàn bộ. Đạt mục tiêu → giải ngân sau khi chốt chiến dịch.",
            "Creator vẫn xác nhận gửi hoặc sẵn sàng nhận tại chỗ kể cả chưa đạt mục tiêu. Trễ SLA gửi hàng → hoàn đơn đó. Đơn đã nhận đủ + chiến dịch đã chốt → giải ngân đúng đơn đó.",
          ],
          [
            "Keep-It-All",
            "Không đạt mục tiêu vẫn giữ tiền ủng hộ, giải ngân sau khi chốt. Không phải quỹ được cấp phép; người ủng hộ không nhận lợi nhuận.",
            "Cùng khóa từng đơn: chốt chiến dịch và khách đã nhận đủ. Trễ SLA gửi hàng hoặc không nhận đủ → hoàn đơn đó, không phụ thuộc mục tiêu.",
          ],
        ],
      },
      note: "SLA gửi hàng (Delivery SLA) = ngày hẹn giao ghi trên chiến dịch + 2 ngày. Nhận đủ = xác nhận trên Kho đồ, quét vé / nhận tại quán, hoặc vận chuyển báo phát thành công mà 7 ngày không khiếu nại. Vốn sản xuất không lấy từ tiền đang giữ — sàn không ứng vốn.",
    },
    {
      kicker: "Luồng hàng Reward",
      title: "Giữ theo đơn đến khi chốt và nhận đủ",
      steps: [
        { n: "01", t: "Thanh toán", d: "PayOS / VietQR. Tiền vào luồng cổng — chưa về creator." },
        { n: "02", t: "Đối soát & giữ", d: "Xác nhận đã nhận. Cấp biên lai. Giữ theo từng đơn, không giải ngân sớm." },
        { n: "03", t: "Gửi hoặc sẵn sàng nhận", d: "Đúng SLA gửi hàng. Giao vận chuyển, hoặc mở nhận tại quán. Trễ SLA → hoàn đơn đó." },
        { n: "04", t: "Nhận đủ", d: "Xác nhận trên Kho đồ, quét vé tại quán, hoặc 7 ngày không khiếu nại sau khi phát thành công. Thiếu / hỏng → khiếu nại, đơn chưa giải ngân." },
        { n: "05", t: "Chốt + giải ngân đơn", d: "Chiến dịch đã kết thúc và đơn đó đã nhận đủ → giải ngân đơn đó. Đơn khác chưa nhận thì vẫn giữ." },
      ],
    },
    {
      kicker: "Kiến trúc",
      title: "Dòng tiền: giữ hộ, đối soát, rồi mới chi",
      body: "Backer không chuyển thẳng cho creator. Cổng thanh toán báo về webhook; sổ đơn nằm trên Postgres; tiền nằm trên tài khoản ngân hàng trung gian đến khi đủ điều kiện chi hộ hoặc hoàn. Phí sàn 8% trừ vào số giải ngân của creator (deducted from payout), không cộng thêm vào giá backer (không mark-up).",
      steps: [
        { n: "01", t: "Checkout", d: "Tạo pledge PENDING. PayOS / VietQR (Sepay) / VNPay. Nội dung chuyển khoản gắn mã đơn." },
        { n: "02", t: "Webhook đối soát", d: "Cổng báo đã nhận. settlePledgeAsPaid → SUCCESS. Cấp giấy TT-UH hoặc biên lai INV- vào Kho đồ." },
        { n: "03", t: "Giữ hộ (escrow)", d: "Tiền trên STK trung gian. Không về creator. Phí 8% trừ payout creator — backer trả đúng giá niêm yết." },
        { n: "04", t: "Giao / nhận", d: "Reward: PROCESSING → gửi ĐVVC hoặc nhận tại quán. Cron hoàn nếu trễ SLA gửi hàng." },
        { n: "05", t: "Chi hộ hoặc hoàn", d: "Donation: chốt chiến dịch theo AoN/KiA. Reward: từng đơn khi đã chốt và đã nhận đủ." },
      ],
      table: {
        headers: ["Trạng thái", "Sổ đơn", "Tiền"],
        rows: [
          [
            "PENDING",
            "Đã tạo, chờ cổng xác nhận.",
            "Chưa vào STK trung gian.",
          ],
          [
            "SUCCESS — đang giữ",
            "Đối soát xong. Donation: giấy chứng nhận. Reward: biên lai, fulfillment PROCESSING.",
            "Nằm trên STK trung gian. Chưa chi hộ creator.",
          ],
          [
            "RELEASED",
            "Đơn đủ điều kiện: chiến dịch đã chốt và (Reward) đã nhận đủ.",
            "Chi hộ về STK creator, trừ phí sàn.",
          ],
          [
            "REFUNDED",
            "AoN không quà miss goal; hoặc trễ SLA gửi hàng; hoặc khiếu nại nhận hàng.",
            "Hoàn về backer. Không giải ngân creator.",
          ],
        ],
      },
      note: "Chi hộ từ tài khoản ngân hàng trung gian + cổng thanh toán. Không tự nhận là trung gian thanh toán theo giấy phép NHNN. Webhook và cron (đóng chiến dịch hết hạn, hoàn trễ SLA) chạy trên hệ thống thật.",
    },
    {
      kicker: "Chứng từ & giao dịch",
      title: "Một chỗ xem đã ủng hộ / đã đặt gì",
      cards: [
        {
          title: "Giấy chứng nhận",
          body: "Donation: cấp sau đối soát. Mã công khai, QR, số tiền bằng chữ.",
        },
        {
          title: "Kho đồ",
          body: "Giấy chứng nhận, vé/quà, đơn chờ nhận, biên lai. Backer xác nhận đã nhận tại đây.",
        },
        {
          title: "Tra cứu giao dịch",
          body: "Trạng thái thanh toán, hoàn, giải ngân theo mã — không cần đăng nhập nếu có mã.",
        },
      ],
      figures: [
        {
          key: "kho-do.jpg",
          alt: "Giao diện Kho đồ của backer",
          caption: "Kho đồ: giấy TT-UH, vé reward, biên lai — một kho cho cả hai nhánh.",
        },
      ],
    },
    {
      kicker: "Case",
      title: "Khai trương quán gà rán nhượng quyền",
      body: "Cùng một chiến dịch: đặt combo (Reward) và ủng hộ không lấy hàng (Donation). Số trên ảnh là minh họa giao diện, không phải số liệu vận hành thật.",
      blocks: [
        {
          heading: "1. Chỉ chạy truyền thống",
          headingTone: "rose",
          figures: [
            {
              key: "ga-ran-truyen-thong.jpg",
              alt: "Khai trương quán gà rán chỉ tiếp cận khách quanh khu",
              caption: "Khách tới quán hôm đó. Người đi ngang, người bận — mất. Không biết nhập bao nhiêu.",
            },
          ],
          bullets: [
            "Bán kính nhỏ quanh cửa.",
            "Không biết đủ / dư / thiếu ngày đầu.",
            "Chạy thêm ngày → tốn chuẩn bị.",
          ],
        },
        {
          heading: "2. Reward — đặt combo, giữ tiền, nhận rồi mới giải ngân",
          headingTone: "emerald",
          figures: [
            {
              key: "ga-ran-nen-tang.jpg",
              alt: "Chiến dịch đặt combo trên Tử Tế Fund",
              caption: "Trang chiến dịch: tiến độ, nút đặt combo. Số vé trên ảnh là minh họa.",
            },
            {
              key: "ve-uu-dai.jpg",
              alt: "Vé ưu đãi khai trương trong Kho đồ",
              caption: "Vé trong Kho đồ: dùng ngày khác nếu bận khai trương. Quét vé tại quán = đã nhận.",
            },
          ],
          bullets: [
            "Đặt combo → tiền giữ, chưa về quán.",
            "Quét vé / nhận combo tại quán = đơn đã nhận đủ.",
            "Chiến dịch chốt + đơn đã nhận → mới giải ngân đúng đơn đó. Đơn chưa nhận thì chưa về creator.",
          ],
        },
        {
          heading: "3. Donation — ủng hộ không lấy combo",
          headingTone: "navy",
          figures: [
            {
              key: "ban-do-quy-mo.jpg",
              alt: "So sánh bán kính truyền thống với phủ điểm đặt trước",
              caption: "Minh họa quy mô: quanh quán vs người đã gắn với chiến dịch trên nền tảng.",
            },
          ],
          cards: [
            {
              title: "Cùng chiến dịch, cửa còn lại",
              body: "Người xa, người không ăn được, người chỉ muốn nâng đỡ quán: ủng hộ không nhận quà → giấy chứng nhận. Không biến khoản đó thành đơn hàng giả.",
            },
            {
              title: "Hai đầu ra, không trộn",
              body: "Combo = biên lai + vé + khóa nhận hàng. Ủng hộ = chứng nhận, giải ngân khi chốt chiến dịch. Cùng hồ sơ quán, pháp lý tách.",
            },
          ],
        },
      ],
    },
    {
      kicker: "Pháp lý",
      title: "Thuần Donation + Reward pre-order — lập luận, chưa phải giấy phép",
      paragraphs: [
        {
          lead: "Bản chất giao dịch",
          text: "Donation là tặng cho, không nhận lợi ích tài chính. Reward pre-order là mua bán hàng hóa hình thành trong tương lai trên sàn thương mại điện tử — không thiết kế thành khoản vay, chứng khoán hay chia lợi nhuận.",
        },
        {
          lead: "Trần P2P (NĐ 94/2025)",
          text: "Lập luận của đồ án: nếu giữ đúng hai nhánh này thì không cùng bản chất P2P Lending nên không lấy trần hạn mức nợ P2P làm “giấy thông hành”. Đây chưa phải kết luận của cơ quan quản lý. Giữ tiền hộ nhiều người vẫn phải thiết kế thận trọng.",
        },
        {
          lead: "Reward",
          text: "Creator là bên bán, kê khai thuế / hóa đơn GTGT theo tư cách của họ. Sàn kết nối, không phải bên bán.",
        },
        {
          lead: "Donation",
          text: "Tặng cho tài sản theo Bộ luật Dân sự: All-or-Nothing là tặng cho có điều kiện (đạt mục tiêu mới giữ); Keep-It-All là tặng cho không điều kiện sau khi chốt. Không góp vốn, không cổ phần, không chia lợi nhuận. Nghị định 93 chỉ khi đã được cấp phép từ thiện — nền tảng không tự xưng quỹ.",
        },
        {
          lead: "Dòng tiền hiện tại",
          text: "PayOS / VietQR + tài khoản ngân hàng trung gian, đối soát bằng webhook. Chi tiết máy trạng thái ở slide Kiến trúc. Chưa phải dịch vụ trung gian thanh toán theo giấy phép Ngân hàng Nhà nước — không đăng ký và không quảng cáo như vậy.",
        },
      ],
      note: "Chứng nhận và biên lai là chứng từ đối chiếu nội bộ, không phải hóa đơn GTGT theo NĐ 123/2020/NĐ-CP. Slide mô tả mô hình sản phẩm, không phải tư vấn luật.",
    },
    {
      kicker: "An toàn thông tin",
      title: "Bảo mật dữ liệu KYC / KYB",
      body: "CCCD, chân dung, giấy phép, STK là dữ liệu nhạy cảm. Chỉ thu tối thiểu để định danh. Không bán, không chia cho bên thứ ba ngoài cổng eKYC và cơ quan khi pháp luật yêu cầu.",
      cards: [
        {
          title: "Đã chạy trên hệ thống",
          body: "eKYC: CCCD trước/sau, selfie, liveness, khớp mặt (VNPT / FPT / sandbox). QR CCCD tự điền, không gọi CSDL Bộ Công an. eKYB tra MST qua VietQR. Đồng ý NĐ 13/2023 trước khi chụp. Ảnh trên Cloudinary; PII trên Neon Postgres. HTTPS/TLS trên Vercel. Admin duyệt hồ sơ.",
          tone: "emerald",
        },
        {
          title: "Lộ trình — chưa nhận đã xong",
          body: "Bucket riêng + URL ký hạn ngắn cho ảnh CCCD (hiện upload thư mục dùng chung). Mã hóa field-level AES-256 cho số CCCD / STK (hiện plaintext trong kyc_info). Khớp tên chủ TK chi hộ 100% với KYC trước khi giải ngân. Nhật ký truy cập hồ sơ nhạy cảm.",
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
          text: "Liveness chống ảnh tĩnh / deepfake. Face-match selfie với CCCD. Chi hộ: tên STK creator phải khớp hồ sơ đã xác minh — đây là thiết kế bắt buộc, không phải tùy chọn UX.",
        },
        {
          lead: "Tuân thủ",
          text: "Thiết kế theo Nghị định 13/2023/NĐ-CP (bảo vệ dữ liệu cá nhân). Wizard eKYC ghi rõ ảnh chỉ dùng định danh. Không tự xưng đã đăng ký với Bộ Công an.",
        },
      ],
      note: "Hội đồng An toàn thông tin nên hỏi phần đã chạy vs lộ trình. Đừng gộp hai cột thành một câu “đã mã hóa AES-256”.",
    },
    {
      kicker: "Rủi ro",
      title: "Né P2P chưa phải hết việc — dân sự, thuế, KYC, KYB",
      body: "Phải đăng ký sàn thương mại điện tử với Bộ Công Thương. Tranh chấp không giao hàng là rủi ro dân sự cao. Nhầm quyên góp với doanh thu là rủi ro thuế.",
      table: {
        headers: ["Tiêu chí", "Mức", "Bản chất"],
        rows: [
          [
            "Hạn mức tài chính (P2P)",
            "Thấp*",
            "Nếu giữ đúng Donation + Reward pre-order thì không bản chất hóa thành vay / chứng khoán. *Lập luận mô hình, chưa được xác nhận.",
          ],
          [
            "Vận hành TMĐT",
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
          title: "KYB — năng lực dự án",
          body: "Giấy tờ pháp nhân thật vẫn vỡ: tính sai chi phí, lỗi hàng, đứt cung ứng. Đánh bóng hồ sơ (ảnh AI, profile mượn) mà sàn duyệt lỏng → rủi ro bị cáo buộc quảng cáo sai sự thật.",
        },
        {
          title: "KYC — dòng tiền và mạo danh",
          body: "Ủng hộ / pre-order lớn không khớp chủ ngân hàng: rủi ro rửa tiền. Deepfake mở tài khoản: người bị mạo danh kiện sàn. Giải pháp: đối soát sinh trắc học và khớp tên chủ tài khoản (matching name) với giấy tờ — chống tài khoản rác.",
        },
      ],
      note: "Cấm Reward kiểu “đóng 10 triệu, chia 5% doanh thu / lãi”. Chỉ cần chia lợi nhuận hoặc cam kết trả lãi là bị kéo sang huy động vốn.",
    },
    {
      kicker: "Công ty tương lai",
      title: "Đăng ký gì, thiết kế gì, không nhận gì",
      cards: [
        {
          title: "Hướng gần",
          body: "Công ty TNHH nền tảng thương mại điện tử / kết nối. Đăng ký sàn Bộ Công Thương. Công bố hai nhánh, cảnh báo pre-order, điều khoản hoàn/giữ. KYC khớp tài khoản; KYB creator.",
        },
        {
          title: "Doanh thu",
          body: "Phí nền tảng 8% trên đơn Reward / chiến dịch thành công — trừ vào số giải ngân creator, không mark-up giá backer. Có thể thu phí xác minh KYB nâng cao cho creator. Donation không lấy phí ẩn trên khoản ủng hộ.",
        },
        {
          title: "Giữ tiền",
          body: "Reward giải ngân từng đơn khi chiến dịch đã chốt và đơn đã nhận đủ. Trễ SLA gửi hàng thì hoàn. Giao dịch bất thường (ví dụ trên 20 triệu/lần) tạm khóa, soi nguồn tiền. Không ứng vốn sản xuất.",
        },
        {
          title: "Không giả danh",
          body: "Không quỹ từ thiện khi chưa cấp phép. Không P2P, không sàn vốn, không token. Không phần thưởng chia lãi. Donation không tự miễn thuế. Trung gian thanh toán NHNN là lộ trình xa — trước đó chỉ cổng + đối soát.",
        },
      ],
    },
    {
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Cho đi thì có giấy. Nhận lại thì có hàng. Không đủ mục tiêu thì rõ hoàn hay giữ. Không đối đầu sàn lớn — mượn họ kể chuyện, đưa người về hồ sơ dự án.",
      bullets: [
        "Hai nhánh, hai chứng từ — không trộn ủng hộ với mua, không biến Reward thành chia lãi.",
        "Reward: giữ theo đơn đến khi chiến dịch chốt và khách nhận đủ. Trễ SLA gửi hàng thì hoàn.",
        "Không lấy trần P2P làm giấy thông hành. Vẫn phải thương mại điện tử, thuế, KYC/KYB, phòng chống rửa tiền.",
      ],
    },
  ],
};
