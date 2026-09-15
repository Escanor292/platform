import type { PresentationDeck } from "@/lib/admin-presentation-types";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 4;

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
      title: "Thuần Donation + Reward pre-order, không phải dịch vụ tài chính",
      paragraphs: [
        {
          lead: "Bản chất giao dịch",
          text: "Donation là tặng cho / ủng hộ không nhận lợi ích tài chính. Reward pre-order là mua bán hàng hóa hình thành trong tương lai trên sàn TMĐT — không phải khoản vay, không phải chứng khoán, không phải dịch vụ tài chính.",
        },
        {
          lead: "Hạn mức gọi vốn tài chính",
          text: "Nếu sàn giữ đúng hai nhánh này, lập luận là không bị áp trần hạn mức đầu tư/gọi vốn kiểu P2P Lending (ví dụ hạn mức nợ theo Nghị định 94/2025/NĐ-CP). Né rủi ro ngân hàng không có nghĩa là hết rủi ro dân sự, thuế và TMĐT.",
        },
        {
          lead: "Reward",
          text: "Creator là bên bán, kê khai thuế / hóa đơn GTGT theo tư cách của họ. Sàn là trung gian kết nối, không phải bên bán.",
        },
        {
          lead: "Donation",
          text: "Không góp vốn, không cổ phần, không chia lợi nhuận. NĐ 93 chỉ khi đã được cấp phép từ thiện — nền tảng không tự xưng quỹ.",
        },
        {
          lead: "Dòng tiền hiện tại",
          text: "PayOS / VietQR + đối soát tài khoản ngân hàng. Chưa phải dịch vụ trung gian thanh toán theo giấy phép NHNN — không đăng ký và không quảng cáo như vậy.",
        },
      ],
      note: "Chứng nhận TT-UH và biên lai INV- là chứng từ đối chiếu nội bộ, không phải hóa đơn GTGT theo NĐ 123/2020/NĐ-CP. Slide mô tả mô hình sản phẩm, không phải tư vấn luật.",
    },
    {
      kicker: "Rủi ro",
      title: "Né P2P chưa phải hết việc",
      body: "Phải đăng ký sàn TMĐT với Bộ Công Thương. Tranh chấp không giao hàng là rủi ro dân sự cao. Nhầm quyên góp với doanh thu là rủi ro thuế.",
      table: {
        headers: ["Tiêu chí", "Mức", "Bản chất"],
        rows: [
          [
            "Hạn mức tài chính (P2P / NĐ 94)",
            "Thấp",
            "Không bản chất hóa dòng tiền thành vay, chứng khoán hay dịch vụ tài chính — nếu giữ đúng Donation + Reward pre-order.",
          ],
          [
            "Pháp lý vận hành",
            "Trung bình",
            "Đăng ký Sàn Thương mại Điện tử với Bộ Công Thương. Công bố điều khoản, hoàn/giữ, cảnh báo pre-order.",
          ],
          [
            "Trách nhiệm dân sự",
            "Cao",
            "Creator không giao quà/hàng. Luật bảo vệ người tiêu dùng: sàn thiếu cảnh báo / kiểm soát có thể bị kéo vào tranh chấp liên đới.",
          ],
          [
            "Thuế và kế toán",
            "Trung bình",
            "Nhầm tiền quyên góp phi lợi nhuận với doanh thu bán hàng. Cá nhân/DN thường nhận Donation có thể bị tính thuế TNCN/TNDN.",
          ],
        ],
      },
      note: "Cấm thiết kế Reward kiểu “đóng 10 triệu, được chia 5% doanh thu / lãi”. Chỉ cần yếu tố chia lợi nhuận hoặc cam kết trả lãi là bị kéo sang huy động vốn / chứng khoán chui.",
    },
    {
      kicker: "KYC & KYB",
      title: "Rủi ro nằm ở năng lực dự án và dòng tiền bẩn",
      cards: [
        {
          title: "KYB — xác thực dự án",
          body: "Giấy tờ pháp nhân thật vẫn vỡ trận: tính sai chi phí, lỗi sản phẩm, đứt chuỗi cung ứng (kiểu Superstrata). Hồ sơ pháp nhân thật nhưng đánh bóng năng lực (ảnh AI, profile mượn) → sàn duyệt lỏng dễ bị cáo buộc quảng cáo sai sự thật.",
        },
        {
          title: "Sàn bị kéo vào kiện",
          body: "Dù là trung gian, Luật BVNTD yêu cầu thông tin cảnh báo rủi ro hàng pre-order. Không có cơ chế kiểm soát / cảnh báo rõ → người mua kiện liên đới.",
        },
        {
          title: "KYC — rửa tiền qua ủng hộ",
          body: "Tài khoản ăn cắp hoặc tiền bẩn donated / mua gói Reward lớn, creator đồng phạm rút tiền mặt. KYC không khớp chủ TK ngân hàng nạp tiền → rủi ro phòng chống rửa tiền (AML).",
        },
        {
          title: "KYC — deepfake / mạo danh",
          body: "Mở tài khoản bằng khuôn mặt giả. Người bị mạo danh thấy dòng tiền qua tên mình rồi kiện sàn vì xác thực sai. Cần khớp người — giấy tờ — chủ tài khoản thanh toán.",
        },
      ],
    },
    {
      kicker: "Khuyến nghị",
      title: "Thiết kế sàn để giới hạn rủi ro, không để “né luật”",
      steps: [
        {
          n: "01",
          t: "Điều khoản rõ",
          d: "Sàn cung cấp nền tảng kết nối. Donation không phải mua hàng. Reward pre-order có rủi ro tiến độ. Creator chịu trách nhiệm giao. Backer được cảnh báo trước khi trả tiền.",
        },
        {
          n: "02",
          t: "Giải ngân theo mốc",
          d: "Không đổ hết tiền cho creator một lần. Reward: giữ đến khi gửi ĐVVC; có thể chia mốc sản xuất → giao hàng. Không giao đúng hạn (ngày hẹn + 2 ngày) → hoàn.",
        },
        {
          n: "03",
          t: "Giám sát giao dịch",
          d: "Cảnh báo khi một tài khoản ủng hộ / pre-order bất thường (ví dụ trên 20 triệu/lần): khoá giải ngân, yêu cầu nguồn tiền, khớp KYC với chủ TK ngân hàng.",
        },
        {
          n: "04",
          t: "Cấm biến tướng",
          d: "Không phần thưởng chia doanh thu, chia lợi nhuận, trả lãi, cam kết sinh lời. Vi phạm → gỡ chiến dịch.",
        },
      ],
    },
    {
      kicker: "Công ty tương lai",
      title: "Đăng ký gì, không đăng ký gì",
      cards: [
        {
          title: "Hướng gần",
          body: "Công ty TNHH nền tảng TMĐT / kết nối creator — backer. Đăng ký sàn với Bộ Công Thương. Công bố hai nhánh, điều khoản hoàn/giữ, cảnh báo pre-order. KYC backer khớp TK; KYB creator.",
        },
        {
          title: "Không giả danh",
          body: "Không quỹ từ thiện khi chưa cấp phép. Không P2P, không sàn vốn, không token, không huy động vốn đại chúng. Reward = bán hàng. Donation = ủng hộ có chứng nhận, không miễn thuế tự động.",
        },
        {
          title: "Lộ trình xa",
          body: "Giữ tiền số lớn trên sổ sàn: xem giấy phép trung gian thanh toán NHNN. Trước đó: cổng thanh toán + đối soát. AML / giám sát giao dịch lớn vận hành từ đầu, không đợi giấy phép.",
        },
      ],
    },
    {
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Cho đi thì có giấy. Nhận lại thì có hàng. Không đủ goal thì rõ hoàn hay giữ. Không đối đầu sàn lớn — mượn họ kể chuyện, đưa người về hồ sơ dự án.",
      bullets: [
        "Hai nhánh, hai chứng từ — không trộn ủng hộ với mua, không biến Reward thành chia lãi.",
        "Hạn giao = ngày hẹn + 2 ngày. Không giao thì hoàn. Giải ngân theo mốc, không đổ một lần.",
        "Không phải P2P nên không lấy trần NĐ 94 làm “giấy thông hành”. Vẫn phải TMĐT, thuế, KYC/KYB, AML.",
      ],
    },
  ],
};
