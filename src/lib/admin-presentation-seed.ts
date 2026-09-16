import type { PresentationDeck } from "@/lib/admin-presentation-types";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 22;

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
          body: "Hàng mẫu, combo, pre-order (đặt trước). Có biên lai. Hoàn nếu trễ SLA (cam kết thời hạn gửi hàng) hoặc khách không nhận đủ. Chỉ giải ngân từng đơn khi chiến dịch đã chốt và đơn đó đã nhận đủ hàng.",
          tone: "emerald",
        },
      ],
    },
    {
      kicker: "Thị trường",
      title: "Crowdfunding tại Việt Nam — khoảng trống lai",
      body: "Không so Shopee: đó là bán SKU (mã hàng có sẵn). Ngách này là huy động vốn / đặt trước. Comicola mạnh văn hóa nhưng thiếu khóa hoàn. App thiện nguyện minh bạch nhưng 100% cho đi. Kickstarter lớn nhưng lệch thanh toán và pháp lý VN. MXH (mạng xã hội) lan tỏa nhưng không có bên giữ tiền.",
      table: {
        headers: ["Nền tảng", "Đại diện / mốc", "Điểm mạnh", "Gót chân Achilles", "Khoảng trống Tử Tế Fund"],
        rows: [
          [
            "Văn hóa & sáng tạo",
            "Comicola — truyện tranh, boardgame, fandom (vd. Thỏ Bảy Màu).",
            "Tệp fan dày. Bán trước sản phẩm văn hóa Việt.",
            "Chủ yếu nghệ thuật/giải trí. Thiếu giữ tiền theo SLA (cam kết thời hạn gửi hàng). Phụ thuộc uy tín tác giả.",
            "Hybrid không giới hạn một ngành. Reward khóa hoàn theo SLA (cam kết thời hạn gửi hàng); Donation cùng hồ sơ.",
          ],
          [
            "Từ thiện / xã hội",
            "Thiện Nguyện MB, Kindmate.",
            "Sao kê, tài khoản minh bạch, niềm tin cộng đồng.",
            "Thuần Donation. Không Reward, không giao hàng, không dành khởi nghiệp thương mại.",
            "Cùng chiến dịch: cho đi có giấy TT-UH, nhận lại có biên lai + giữ tiền đến khi nhận đủ.",
          ],
          [
            "Sàn quốc tế",
            "Kickstarter / Indiegogo (2008–2009). Backer toàn cầu.",
            "Quy trình Reward chuẩn. Indiegogo có Keep-It-All. Chiến dịch lớn.",
            "Visa/Stripe, ngôn ngữ, ship/tax. Khó đòi khi ngâm vốn. Không chứng từ nội địa VN.",
            "Nội địa hóa: VietQR / chuyển khoản STK (số tài khoản) trung gian. eKYC (định danh điện tử). Escrow (giữ hộ tiền) theo đơn. Giấy TT-UH / INV-.",
          ],
          [
            "Gây quỹ MXH (mạng xã hội)",
            "Facebook / TikTok / Zalo.",
            "Viral, chi phí vào ban đầu thấp, nói chuyện trực tiếp.",
            "Không bên thứ ba giữ tiền. Trôi bài. Thiếu SLA (cam kết thời hạn gửi hàng) và hồ sơ pháp lý khi chậm giao.",
            "Mượn MXH (mạng xã hội) dẫn về hồ sơ. Tiền giữ trên STK (số tài khoản) trung gian đến khi chốt + nhận đủ — không tự xưng trung gian NHNN (Ngân hàng Nhà nước).",
          ],
        ],
      },
      note: "Lấp chỗ: minh bạch kiểu kênh thiện nguyện + khóa tiền/hàng kiểu TMĐT (thương mại điện tử), trên một nền tảng crowdfunding nội địa. Không đối đầu bảng tin MXH (mạng xã hội). Không giải ngân theo mốc sản xuất — Reward giải ngân từng đơn khi chiến dịch đã chốt và khách đã nhận đủ.",
    },
    {
      kicker: "Khách hàng nhắm đến",
      title: "Chân dung người dùng — Creator và Backer",
      body: "Hai phía, hai nhu cầu. Creator cần cộng đồng và đặt trước để kiểm chứng thị trường. Backer cần minh bạch khi cho đi, và khóa hoàn khi nhận lại.",
      cards: [
        {
          title: "Creator",
          body: "Cá nhân hoặc doanh nghiệp: mở nghề nhỏ, nhượng quyền F&B, thủ công, khóa học, sản phẩm sáng tạo. Cần pre-order để biết nhập bao nhiêu, cộng đồng đồng hành — không chỉ một đơn rời trên Shopee.",
        },
        {
          title: "Backer — Cho đi",
          body: "Ủng hộ nhân đạo hoặc nâng đỡ quán / dự án, không lấy hàng. Cần minh bạch và giấy chứng nhận TT-UH để lưu, không biến khoản ủng hộ thành đơn hàng giả.",
          tone: "rose",
        },
        {
          title: "Backer — Nhận lại",
          body: "Muốn trải nghiệm sớm, combo, vé, pre-order (đặt trước). Sợ bùng hàng. Cần giữ tiền, SLA (cam kết thời hạn gửi hàng), hoàn nếu trễ hoặc không nhận đủ.",
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
            "Creator vẫn xác nhận gửi hoặc sẵn sàng nhận tại chỗ kể cả chưa đạt mục tiêu. Trễ SLA (cam kết thời hạn gửi hàng) → hoàn đơn đó. Đơn đã nhận đủ + chiến dịch đã chốt → giải ngân đúng đơn đó.",
          ],
          [
            "Keep-It-All",
            "Không đạt mục tiêu vẫn giữ tiền ủng hộ, giải ngân sau khi chốt. Không phải quỹ được cấp phép; người ủng hộ không nhận lợi nhuận.",
            "Cùng khóa từng đơn: chốt chiến dịch và khách đã nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng) hoặc không nhận đủ → hoàn đơn đó, không phụ thuộc mục tiêu.",
          ],
        ],
      },
      note: "SLA (cam kết thời hạn gửi hàng) = ngày hẹn giao ghi trên chiến dịch + 2 ngày — áp cho hàng ship / nhận tại chỗ, không áp cho phiếu/sản phẩm đã cấp. Phiếu/sản phẩm vào Kho đồ = đã giao quà; giải ngân khi chốt chiến dịch. Hàng vật lý: nhận đủ = xác nhận trên Kho đồ, hoặc vận chuyển báo phát thành công mà 7 ngày không khiếu nại. Vốn sản xuất không lấy từ tiền đang giữ — sàn không ứng vốn.",
    },
    {
      kicker: "Luồng hàng Reward",
      title: "Giữ theo đơn đến khi chốt và nhận đủ",
      steps: [
        { n: "01", t: "Thanh toán", d: "VietQR / chuyển khoản STK (số tài khoản) trung gian. Tiền chưa về creator." },
        { n: "02", t: "Đối soát & giữ", d: "Xác nhận đã nhận. Cấp biên lai. Giữ theo từng đơn, không giải ngân sớm." },
        { n: "03", t: "Gửi hoặc sẵn sàng nhận", d: "Đúng SLA (cam kết thời hạn gửi hàng). Giao vận chuyển, hoặc mở nhận tại quán. Trễ hạn → hoàn đơn đó." },
        { n: "04", t: "Nhận đủ", d: "Hàng ship: xác nhận trên Kho đồ, hoặc 7 ngày không khiếu nại sau khi phát thành công. Phiếu/sản phẩm: đã nằm trong Kho đồ = đã giao quà — quét tại quán chỉ để đổi ưu đãi, không phải mốc giải ngân." },
        { n: "05", t: "Chốt + giải ngân đơn", d: "Chiến dịch đã kết thúc và đơn đó đã nhận đủ → giải ngân đơn đó. Đơn khác chưa nhận thì vẫn giữ." },
      ],
    },
    {
      kicker: "Kiến trúc",
      title: "Dòng tiền: giữ hộ, đối soát, rồi mới chi",
      body: "Backer không chuyển thẳng cho creator. Cổng thanh toán báo về webhook (cổng báo đã nhận tiền); sổ đơn nằm trên Postgres; tiền nằm trên tài khoản ngân hàng trung gian đến khi đủ điều kiện chi hộ hoặc hoàn. Phí sàn 8% trừ vào số giải ngân của creator (deducted from payout — trừ payout), không cộng thêm vào giá backer (không mark-up).",
      steps: [
        { n: "01", t: "Checkout", d: "Tạo pledge PENDING. VietQR / chuyển khoản STK (số tài khoản) trung gian. Nội dung chuyển khoản gắn mã đơn." },
        { n: "02", t: "Webhook đối soát", d: "Cổng báo đã nhận. settlePledgeAsPaid → SUCCESS. Cấp giấy TT-UH hoặc biên lai INV- vào Kho đồ." },
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
      note: "Chi hộ từ tài khoản ngân hàng trung gian + cổng thanh toán. Không tự nhận là trung gian thanh toán theo giấy phép NHNN (Ngân hàng Nhà nước). Webhook (cổng báo đã nhận tiền) và cron (đóng chiến dịch hết hạn, hoàn trễ SLA — cam kết thời hạn gửi hàng) chạy trên hệ thống thật.",
    },
    {
      kicker: "Chứng từ & giao dịch",
      title: "Một chỗ xem đã ủng hộ / đã đặt gì",
      body: "Tab Người ủng hộ công khai trên trang chiến dịch. Sao kê là đúng Báo cáo đối soát của creator — ledger pledge, không xóa lịch sử, dòng đỏ là đảo/hoàn. Kho đồ là chỗ backer giữ chứng từ. Số trên mẫu là minh họa giao diện, không phải số liệu vận hành thật.",
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
          body: "Giấy chứng nhận, vé/quà, đơn chờ nhận, biên lai. Backer xác nhận đã nhận tại đây.",
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
          caption: "Kho đồ: giấy TT-UH, vé reward, biên lai — một kho cho cả hai nhánh.",
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
          text: "VietQR + tài khoản ngân hàng trung gian, đối soát bằng webhook (cổng báo đã nhận tiền). Chi tiết máy trạng thái ở slide Kiến trúc. Chưa phải dịch vụ trung gian thanh toán theo giấy phép Ngân hàng Nhà nước — không đăng ký và không quảng cáo như vậy.",
        },
      ],
      note: "Chứng nhận và biên lai là chứng từ đối chiếu nội bộ, không phải hóa đơn GTGT theo NĐ 123/2020/NĐ-CP. Slide mô tả mô hình sản phẩm, không phải tư vấn luật.",
    },
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
          title: "Lộ trình — chưa nhận đã xong",
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
      note: "Hội đồng An toàn thông tin nên hỏi phần đã chạy vs lộ trình. Đừng gộp hai cột thành một câu “đã mã hóa AES-256”.",
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
      note: "Cấm Reward kiểu “đóng 10 triệu, chia 5% doanh thu / lãi”. Chỉ cần chia lợi nhuận hoặc cam kết trả lãi là bị kéo sang huy động vốn.",
    },
    {
      kicker: "Công ty tương lai",
      title: "Đăng ký gì, thiết kế gì — bệ phóng khởi nghiệp",
      body: "Không chỉ cổng thu tiền. Hướng gần: Công ty TNHH, đăng ký sàn Bộ Công Thương. Định vị Tử Tế Fund là lựa chọn đầu tiên (top-of-mind) khi ai đó bắt đầu lập nghiệp: đóng gói ý tưởng, tìm khách đầu, kiểm chứng lực cầu trước khi bỏ vốn lớn. Bộ công cụ tư vấn pháp lý / tài chính là lộ trình — chưa nhận đã chạy hết.",
      cards: [
        {
          title: "Top-of-mind cho lập nghiệp",
          body: "Cá nhân hoặc doanh nghiệp: quán, xưởng thủ công, sản phẩm công nghệ. Tìm 100 khách đầu (early adopters), biết nhập bao nhiêu, đóng gói hồ sơ — không chỉ một đơn rời trên sàn bán SKU.",
        },
        {
          title: "Bộ công cụ — lộ trình",
          body: "Tư vấn pháp lý & thuế: chọn mô hình Cá nhân / Hộ KD / TNHH, kê khai đơn Reward, xuất hóa đơn đúng vai người bán. Tối ưu tài chính: điểm hòa vốn, định giá combo, goal sát chi phí thật. Wizard KYC/KYB (xác minh cá nhân / doanh nghiệp) đã có trên hệ thống; công cụ tính hòa vốn và tư vấn thuế tự động là bước tiếp.",
        },
        {
          title: "Doanh thu và giữ tiền",
          body: "Phí 8% trừ payout creator, không mark-up giá backer — phí sàn + đóng gói/kiểm duyệt, không chỉ máy chủ. Có thể thu phí KYB (xác minh doanh nghiệp) nâng cao. Reward: phiếu/sản phẩm giải ngân khi chốt; hàng ship khi chốt và đã nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng) thì hoàn. Donation không phí ẩn trên khoản ủng hộ.",
        },
        {
          title: "Pháp lý",
          body: "Sàn kết nối + hỗ trợ đóng gói dự án. Không quỹ từ thiện khi chưa cấp phép. Không P2P (cho vay ngang hàng), không sàn vốn, không token, không chia lãi. Không tự xưng ngân hàng hay trung gian thanh toán NHNN (Ngân hàng Nhà nước).",
        },
      ],
    },
    {
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Nơi biến ý tưởng trên giấy thành dự án thật. Cho đi thì có giấy. Nhận lại thì có hàng. Creator có điểm tựa pháp lý và tài chính; backer có tiền được giữ đến đúng điều kiện.",
      bullets: [
        "Bệ phóng: điểm đến đầu của người lập nghiệp — tư vấn quy trình, pháp lý, tài chính để Creator yên tâm kinh doanh. Không đối đầu sàn lớn — mượn họ kể chuyện, đưa người về hồ sơ.",
        "Hai nhánh, hai chứng từ: Cho đi (Donation) và Nhận lại (Reward) tách minh bạch — không trộn ủng hộ với mua, không biến Reward thành chia lãi.",
        "Bảo vệ bằng vận hành: phiếu/sản phẩm giải ngân khi chốt; hàng ship giữ đến khi chốt và nhận đủ. Trễ SLA (cam kết thời hạn gửi hàng) thì hoàn.",
        "Tuân thủ: không lấy trần P2P (cho vay ngang hàng) làm giấy thông hành. Vẫn TMĐT (thương mại điện tử), thuế, KYC/KYB (xác minh cá nhân / doanh nghiệp), an toàn dữ liệu.",
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
            "VietQR / chuyển khoản → webhook (cổng báo đã nhận tiền) SUCCESS",
            "Giấy TT-UH (chứng nhận ủng hộ) vào Kho đồ",
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
      note: "PII (dữ liệu định danh) KYC (xác minh cá nhân) hiện plaintext trên Neon; ảnh CCCD trên Cloudinary. Chat: MongoDB. Cache: Redis. Không vẽ hết blog_*, conversations.",
    },
    {
      kicker: "Phụ lục",
      title: "src/lib",
      body: "Phụ lục kỹ thuật. App Router nằm src/app. Dưới đây là thư viện lõi của mô hình lai. Tên file đúng repo.",
      tree: [
        { path: "src/lib/payment/", note: "tạo đơn, escrow (giữ hộ), VietQR, chuyển khoản STK trung gian, đối soát, hoàn" },
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
  ],
};
