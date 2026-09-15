import type { PresentationDeck } from "@/lib/admin-presentation-types";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 3;

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
      body: "Chỗ để bắt đầu một dự án tử tế: gây quỹ nhân đạo, đặt trước sản phẩm, và lưu hồ sơ hành trình — không phải mạng xã hội, không phải sàn bán hàng.",
      cards: [
        {
          title: "Cho đi (Donation)",
          body: "Ủng hộ vì mục đích nhân đạo. Không nhận lại lợi ích tài chính hay vật chất lớn. Đầu ra: giấy chứng nhận ủng hộ.",
          tone: "rose",
        },
        {
          title: "Nhận lại (Reward)",
          body: "Hàng mẫu, hiện vật, combo có sẵn hoặc pre-order. Có giao, có biên lai, có hoàn khi không gửi vận chuyển đúng hẹn.",
          tone: "emerald",
        },
      ],
    },
    {
      kicker: "Khoảng trống",
      title: "Không thay Facebook, không đánh Shopee",
      body: "Shopee bán SKU có sẵn. Facebook/Zalo kể chuyện và kêu gọi. Tử Tế Fund giữ chiến dịch, dòng tiền đối soát, chứng từ và kho quà trên một hồ sơ dự án.",
      cards: [
        {
          title: "Quốc tế — tách nhánh",
          body: "Kickstarter: All-or-Nothing + reward. Indiegogo: AoN hoặc Keep-It-All. GoFundMe: donation, giữ tiền. BackerKit: giao hàng sau chiến dịch.",
        },
        {
          title: "Việt Nam — đang rời",
          body: "Gây quỹ trên Facebook/Zalo, Heo Vàng / kênh ví, pre-order Shopee·Lazada, website tự host. Thiếu một chỗ gói chứng từ donation + hạn giao reward + nhật ký dự án + thanh toán nội địa.",
        },
        {
          title: "Hợp tác, không đối đầu",
          body: "Kể chuyện trên MXH, giao hàng nhờ ĐVVC/sàn. Nền tảng không cạnh tranh logistic hay newsfeed — mượn sức họ rồi đưa người về hồ sơ chiến dịch.",
        },
        {
          title: "Ai dùng",
          body: "Người mở nghề nhỏ, nhượng quyền, khóa học, sản phẩm. Người cần cộng đồng chứ không chỉ một đơn rời. Backer muốn ủng hộ hoặc đặt trước có kiểm soát hoàn.",
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
          body: "Cho đi. Không cổ phần, không lợi nhuận. Sau đối soát: giấy chứng nhận TT-UH tại /chung-tu. Không phải hóa đơn GTGT.",
          tone: "rose",
        },
        {
          title: "Nhận quà tri ân (Reward)",
          body: "Giao dịch có hàng: sẵn kho hoặc pre-order. Biên lai INV- nội bộ. Hóa đơn GTGT (nếu cần) do creator xuất với tư cách người bán.",
          tone: "emerald",
        },
      ],
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Mẫu giấy chứng nhận ủng hộ TT-UH",
          caption: "Mẫu giao diện /chung-tu — giấy chứng nhận Donation. Không phải chứng từ đã cấp cho một giao dịch thật.",
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
      body: "Thời hạn chiến dịch gây quỹ thường khoảng 2 tháng. Hạn gửi vận chuyển = ngày hẹn giao ghi trên chiến dịch, cộng thêm 2 ngày. Không tính 2 ngày ngay sau khi thanh toán.",
      table: {
        headers: ["Mô hình", "Donation (không quà)", "Reward (có giao hàng)"],
        rows: [
          [
            "All-or-Nothing",
            "Hết hạn mà không đạt goal → hoàn toàn bộ. Đạt goal → giải ngân sau khi chốt chiến dịch.",
            "Creator vẫn bấm xác nhận giao kể cả khi chưa đạt goal. Giải ngân khi đã gửi ĐVVC. Không gửi trong hạn (ngày hẹn + 2 ngày) → hủy và hoàn. Không bấm giao và không đạt goal → hoàn.",
          ],
          [
            "Keep-It-All",
            "Không đạt goal vẫn giữ tiền ủng hộ sau khi chốt. Không phải quỹ được cấp phép; người ủng hộ không nhận lợi nhuận.",
            "Không giữ tiền nếu không giao. Quá hạn gửi ĐVVC (ngày hẹn + 2 ngày) → hoàn, kể cả khi đã đủ hay chưa đủ goal.",
          ],
        ],
      },
      note: "Hàng có sẵn: ngày hẹn giao có thể là ngay sau thanh toán. Pre-order: ngày hẹn là mốc creator công bố trên chiến dịch. Trễ quá 2 ngày sau mốc đó mới hủy và hoàn.",
    },
    {
      kicker: "Luồng hàng Reward",
      title: "Đối soát, giữ, giao, rồi mới giải ngân",
      steps: [
        { n: "01", t: "Thanh toán", d: "PayOS / VietQR. Tiền vào luồng cổng — chưa về creator." },
        { n: "02", t: "Đối soát", d: "Admin/cổng xác nhận đã nhận. Chứng từ hoặc biên lai mới được cấp." },
        { n: "03", t: "Giữ theo mô hình", d: "AoN chờ goal + hạn. KiA donation: giữ sau chốt. Reward: giữ đến khi gửi ĐVVC." },
        { n: "04", t: "Gửi ĐVVC", d: "Hạn = ngày hẹn trên chiến dịch + 2 ngày. Trễ → hoàn." },
        { n: "05", t: "Giải ngân / hoàn", d: "Backer theo dõi Kho đồ và /lookup. Khiếu nại trên cùng hồ sơ." },
      ],
    },
    {
      kicker: "Chứng từ & giao dịch",
      title: "Một chỗ xem đã ủng hộ / đã đặt gì",
      cards: [
        {
          title: "Giấy TT-UH",
          body: "Donation: cấp sau đối soát. Mã công khai, QR, số tiền bằng chữ. Xem /chung-tu/[mã].",
        },
        {
          title: "Kho đồ /purchases",
          body: "Giấy chứng nhận, vé/quà, đơn chờ giao, biên lai INV-. Backer không phải lùng trong tin nhắn.",
        },
        {
          title: "Tra cứu /lookup",
          body: "Trạng thái thanh toán, hoàn, giải ngân — theo mã giao dịch, không cần đăng nhập nếu có mã.",
        },
      ],
      figures: [
        {
          key: "kho-do.jpg",
          alt: "Giao diện Kho đồ của backer",
          caption: "Trang /purchases: giấy TT-UH, vé reward, biên lai — một kho cho cả hai nhánh.",
        },
      ],
    },
    {
      kicker: "Case",
      title: "Khai trương quán gà rán nhượng quyền",
      body: "Cùng một chiến dịch mở hai cửa: đặt combo (Reward) và ủng hộ khai trương không lấy hàng (Donation). Minh họa bên dưới dùng số ví dụ trên giao diện, không phải số liệu vận hành thật.",
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
          heading: "2. Reward — đặt combo trước, ghé sau",
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
              caption: "Vé trong /purchases: dùng ngày khác nếu bận khai trương.",
            },
          ],
          bullets: [
            "Biết số combo đã thanh toán → nhập đúng nguyên liệu.",
            "Vé đã mua là lý do quay lại, không chỉ một buổi rồi quên.",
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
              body: "Người xa, người không ăn được, người chỉ muốn nâng đỡ quán: ủng hộ không nhận quà → giấy TT-UH. Không biến khoản đó thành đơn hàng giả.",
            },
            {
              title: "Hai đầu ra, không trộn",
              body: "Combo = biên lai + vé. Ủng hộ = chứng nhận. Cùng hồ sơ quán, pháp lý tách.",
            },
          ],
        },
      ],
    },
    {
      kicker: "Pháp lý",
      title: "Nêu đúng mức, không nhận giấy phép chưa có",
      paragraphs: [
        {
          lead: "Reward",
          text: "là bán hàng: có hàng, có giá, có giao. Creator là bên bán, kê khai thuế / hóa đơn GTGT theo tư cách của họ. Sàn không phải bên bán.",
        },
        {
          lead: "Donation",
          text: "không phải góp vốn, không phải cổ phần, không chia lợi nhuận. Người ủng hộ nhận giấy chứng nhận. NĐ 93 chỉ áp khi hoạt động từ thiện đúng phạm vi đã được cấp phép — nền tảng không tự xưng quỹ từ thiện.",
        },
        {
          lead: "Dòng tiền hiện tại",
          text: "thanh toán qua cổng PayOS / VietQR, đối soát vào tài khoản ngân hàng. Đây chưa phải dịch vụ trung gian thanh toán theo giấy phép NHNN — không đăng ký và không quảng cáo như vậy.",
        },
      ],
      note: "Chứng nhận TT-UH và biên lai INV- là chứng từ đối chiếu nội bộ, không phải hóa đơn GTGT / hóa đơn điện tử theo NĐ 123/2020/NĐ-CP. Trang này mô tả mô hình sản phẩm, không phải tư vấn luật.",
    },
    {
      kicker: "Công ty tương lai",
      title: "Đăng ký gì, không đăng ký gì",
      cards: [
        {
          title: "Hướng gần",
          body: "Công ty TNHH cung cấp nền tảng TMĐT / kết nối creator — backer. Website công bố hai nhánh Donation và Reward. KYC creator, công bố điều khoản hoàn/giữ.",
        },
        {
          title: "Không giả danh",
          body: "Không quỹ từ thiện khi chưa được cấp phép. Không sàn vốn, không token, không huy động vốn đại chúng. Reward kê như bán hàng. Donation kê như ủng hộ có chứng nhận.",
        },
        {
          title: "Lộ trình xa",
          body: "Nếu/khi giữ tiền số lớn trên sổ sách sàn: xem điều kiện giấy phép trung gian thanh toán NHNN. Trước đó: cổng thanh toán + đối soát, không tự nhận là trung gian.",
        },
      ],
    },
    {
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Cho đi thì có giấy. Nhận lại thì có hàng. Không đủ goal thì rõ hoàn hay giữ. Không đối đầu sàn lớn — mượn họ kể chuyện, đưa người về hồ sơ dự án.",
      bullets: [
        "Hai nhánh, hai chứng từ — không trộn ủng hộ với mua.",
        "Hạn giao = ngày hẹn + 2 ngày. Reward không giao thì hoàn.",
        "Pháp lý nói đúng mức giấy phép hiện có — không nhận thứ chưa được cấp.",
      ],
    },
  ],
};
