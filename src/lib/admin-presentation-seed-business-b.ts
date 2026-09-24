import type { PresentationSlide } from "@/lib/admin-presentation-types";

export const BUSINESS_SLIDES_B: PresentationSlide[] = [
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
            "Creator vẫn xác nhận gửi hoặc sẵn sàng nhận tại chỗ kể cả chưa đạt mục tiêu. Trễ SLA (cam kết thời hạn gửi hàng) → hoàn đơn đó. Đơn đã nhận đủ + chiến dịch đã chốt → giải ngân đúng đơn đó.",
          ],
          [
            "Keep-It-All",
            "Không đạt mục tiêu vẫn giữ tiền ủng hộ, giải ngân sau khi chốt. Không phải quỹ được cấp phép; người ủng hộ không nhận lợi nhuận.",
            "Cùng khóa từng đơn: chốt chiến dịch và khách đã nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng) hoặc không nhận đủ → hoàn đơn đó, không phụ thuộc mục tiêu.",
          ],
        ],
      },
    },
{
      kicker: "Luồng hàng Reward",
      title: "Giữ theo đơn đến khi chốt và nhận đủ",
      steps: [
        { n: "01", t: "Thanh toán", d: "Màn có ví, thẻ quốc tế, NAPAS, VietQR. Tiền vào STK (số tài khoản) trung gian, chưa về creator." },
        { n: "02", t: "Đối soát & giữ", d: "Xác nhận đã nhận. Cấp biên lai. Giữ theo từng đơn, không giải ngân sớm." },
        { n: "03", t: "Gửi hoặc sẵn sàng nhận", d: "Đúng SLA (cam kết thời hạn gửi hàng). Giao vận chuyển, hoặc mở nhận tại quán. Trễ hạn → hoàn đơn đó." },
        { n: "04", t: "Nhận đủ", d: "Hàng ship: xác nhận trên Kho đồ, hoặc 7 ngày không khiếu nại sau khi phát thành công. Phiếu/sản phẩm: đã nằm trong Kho đồ = đã giao quà — quét tại quán chỉ để đổi ưu đãi, không phải mốc giải ngân." },
        { n: "05", t: "Chốt + giải ngân đơn", d: "Chiến dịch đã kết thúc và đơn đó đã nhận đủ → giải ngân đơn đó. Đơn khác chưa nhận thì vẫn giữ." },
      ],
    },
{
      kicker: "Kiến trúc",
      title: "Dòng tiền: giữ hộ, đối soát, rồi mới chi",
      body: "Backer không chuyển thẳng cho creator. Màn checkout có bốn kênh nhưng đơn ONLINE ghi BANK_ESCROW và mở trang chuyển khoản. Sổ đơn nằm trên Postgres; tiền nằm trên tài khoản ngân hàng trung gian đến khi đối soát rồi mới chi hộ hoặc hoàn. Phí sàn 8% trừ vào số giải ngân của creator (deducted from payout — trừ payout), không cộng thêm vào giá backer (không mark-up).",
      steps: [
        { n: "01", t: "Checkout", d: "Tạo pledge PENDING. Bốn kênh trên màn; API không nhận thẻ hoặc ví đã lưu. Trang chuyển khoản STK (số tài khoản) trung gian, nội dung gắn mã đơn." },
        { n: "02", t: "Đối soát STK", d: "Tiền vào tài khoản trung gian thì settlePledgeAsPaid → SUCCESS. Khách chưa login: giấy TT-UH chỉ gửi Gmail. Đã đăng nhập: gửi Gmail và lưu Kho đồ. Reward: biên lai INV- và quà trong Kho đồ." },
        { n: "03", t: "Giữ hộ (escrow)", d: "Tiền trên STK (số tài khoản) trung gian. Không về creator. Phí 8% trừ payout creator — backer trả đúng giá niêm yết." },
        { n: "04", t: "Giao / nhận", d: "Reward: PROCESSING → gửi ĐVVC (đơn vị vận chuyển) hoặc nhận tại quán. Cron hoàn nếu trễ SLA (cam kết thời hạn gửi hàng)." },
        { n: "05", t: "Chi hộ hoặc hoàn", d: "Donation: chốt chiến dịch theo AoN (đạt mục tiêu mới giữ) / KiA (giữ kể cả chưa đạt). Reward: từng đơn khi đã chốt và đã nhận đủ." },
      ],
      table: {
        headers: ["Trạng thái", "Sổ đơn", "Tiền"],
        rows: [
          [
            "PENDING",
            "Đã tạo, chờ cổng xác nhận.",
            "Chưa vào STK (số tài khoản) trung gian.",
          ],
          [
            "SUCCESS — đang giữ",
            "Đối soát xong. Donation: giấy chứng nhận. Reward: biên lai, fulfillment PROCESSING.",
            "Nằm trên STK (số tài khoản) trung gian. Chưa chi hộ creator.",
          ],
          [
            "RELEASED",
            "Đơn đủ điều kiện: chiến dịch đã chốt và (Reward) đã nhận đủ.",
            "Chi hộ về STK (số tài khoản) creator, trừ phí sàn.",
          ],
          [
            "REFUNDED",
            "AoN (All-or-Nothing — không quà, miss goal); hoặc trễ SLA (cam kết thời hạn gửi hàng); hoặc khiếu nại nhận hàng.",
            "Hoàn về backer. Không giải ngân creator.",
          ],
        ],
      },
    },
{
      kicker: "Chứng từ & giao dịch",
      title: "Một chỗ xem đã ủng hộ / đã đặt gì",
      body: "Tab Người ủng hộ công khai trên trang chiến dịch. Sao kê là đúng Báo cáo đối soát của creator — ledger pledge, không xóa lịch sử, dòng đỏ là đảo/hoàn. Kho đồ là chỗ tài khoản đã đăng nhập giữ chứng từ và quà. Khách chưa login chỉ nhận Gmail. Số trên mẫu là minh họa giao diện, không phải số liệu vận hành thật.",
      cards: [
        {
          title: "Người ủng hộ",
          body: "Tab công khai trên hồ sơ chiến dịch. Tên, số tiền, thời điểm. Được ẩn danh. Đây là mặt cộng đồng — không thay sao kê tiền.",
        },
        {
          title: "Sao kê — Báo cáo đối soát",
          body: "Đúng màn hình creator: tổng khi kết thúc, tổng thực tế, đã đảo, từng dòng SUCCESS / REFUNDED. Xuất CSV. Tính từ ledger pledge, không xóa giao dịch lịch sử.",
        },
        {
          title: "Kho đồ",
          body: "Chỉ tài khoản đã đăng nhập: giấy TT-UH, vé/quà, đơn chờ nhận, biên lai. Khách chưa login không có Kho đồ — giấy gửi Gmail.",
        },
        {
          title: "Tra cứu giao dịch",
          body: "Trạng thái thanh toán, hoàn, giải ngân theo mã — không cần đăng nhập nếu có mã.",
        },
      ],
      figures: [
        {
          key: "nguoi-ung-ho",
          alt: "Tab Người ủng hộ trên trang chiến dịch",
          caption: "Giao diện tab Người ủng hộ trên trang chiến dịch — cùng component BackerLink của hệ thống.",
        },
        {
          key: "sao-ke-he-thong",
          alt: "Báo cáo đối soát chiến dịch",
          caption: "Đúng màn hình Báo cáo đối soát của creator: ledger pledge, xuất CSV, dòng đỏ là đảo/hoàn. Không phải bảng vẽ tay.",
        },
        {
          key: "kho-do.jpg",
          alt: "Giao diện Kho đồ của backer",
          caption: "Kho đồ của tài khoản đã đăng nhập: giấy TT-UH, vé reward, biên lai. Khách chưa login không vào được kho này.",
        },
      ],
    },
{
      kicker: "Case",
      title: "Khai trương quán gà rán nhượng quyền",
      body: "Cùng một chiến dịch: vé Reward (phiếu giảm hoặc combo) và ủng hộ không lấy hàng (Donation). Vé vào Kho đồ là đã nhận quà — không giữ tiền chờ quét tại quán. Số trên ảnh là minh họa giao diện, không phải số liệu vận hành thật.",
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
          heading: "2. Reward — phiếu/sản phẩm vào Kho đồ, giải ngân khi chốt",
          headingTone: "emerald",
          figures: [
            {
              key: "ga-ran-nen-tang.jpg",
              alt: "Chiến dịch đặt combo trên Tử Tế Fund",
              caption: "Trang chiến dịch: tiến độ, nút đặt vé/combo. Số trên ảnh là minh họa.",
            },
            {
              key: "ve-uu-dai.jpg",
              alt: "Vé ưu đãi khai trương trong Kho đồ",
              caption: "Vé trong Kho đồ = quà đã nhận: phiếu giảm giá hoặc combo đặc biệt. Dùng ngày khác nếu bận khai trương. Quét QR tại quán chỉ để đổi ưu đãi.",
            },
          ],
          bullets: [
            "Đặt vé / phiếu / combo → tiền giữ đến khi chốt chiến dịch, chưa về quán.",
            "Vé vào Kho đồ là đã giao quà (phiếu giảm hoặc combo đặc biệt).",
            "Chiến dịch kết thúc → giải ngân. Quét tại quán = đổi ưu đãi, không phải mốc giữ tiền.",
          ],
        },
        {
          heading: "3. Donation — ủng hộ không lấy vé",
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
              body: "Phiếu/sản phẩm = biên lai + quà đã cấp điện tử, giải ngân khi chốt. Ủng hộ = chứng nhận, giải ngân khi chốt. Cùng hồ sơ quán, pháp lý tách.",
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
          lead: "Trần P2P (cho vay ngang hàng — NĐ 94/2025)",
          text: "Lập luận của đồ án: nếu giữ đúng hai nhánh này thì không cùng bản chất P2P Lending (cho vay ngang hàng) nên không lấy trần hạn mức nợ P2P (cho vay ngang hàng) làm “giấy thông hành”. Đây chưa phải kết luận của cơ quan quản lý. Giữ tiền hộ nhiều người vẫn phải thiết kế thận trọng.",
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
          text: "Bốn kênh trên màn hình, tiền vào tài khoản ngân hàng trung gian, đối soát bằng settlePledgeAsPaid. Chi tiết ở slide Kiến trúc. Chưa phải dịch vụ trung gian thanh toán theo giấy phép Ngân hàng Nhà nước — không đăng ký và không quảng cáo như vậy.",
        },
      ],
    },
];
