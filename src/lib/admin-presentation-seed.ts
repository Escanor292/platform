import type { PresentationDeck } from "@/lib/admin-presentation-types";

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
  brand: "Tử Tế Fund · Thuyết trình nội bộ",
  title: "Mô hình lai Donation + Reward",
  slides: [
    {
      variant: "hero",
      kicker: "Bảo vệ đồ án · Tử Tế Fund",
      title: "Nền tảng gây quỹ lai",
      titleAccent: "Cho đi và Nhận lại",
      body: "Nơi người trẻ và người trưởng thành bắt đầu sự nghiệp, xây cộng đồng, thương hiệu cá nhân, và lưu trữ hành trình làm dự án một cách chuyên nghiệp.",
      figures: [
        {
          key: "donation-reward.jpg",
          alt: "Hai nhánh: ủng hộ nhận giấy chứng nhận, đặt hàng nhận sản phẩm",
          caption: "Hai đầu ra của cùng một nền tảng: giấy chứng nhận khi cho đi, hàng hóa khi nhận lại.",
        },
      ],
    },
    {
      kicker: "Tầm nhìn",
      title: "Không thay Facebook, không đánh Shopee",
      cards: [
        {
          title: "Hợp tác, mượn sức mạnh",
          body: "Phân phối câu chuyện qua mạng xã hội và sàn lớn. Tử Tế Fund giữ thanh toán trung gian, nhật ký dự án, chứng từ và kho quà.",
        },
        {
          title: "Nhiều dạng nội dung",
          body: "Blog, video, bài viết, cập nhật chiến dịch. Ai mạnh kênh nào thì dùng kênh đó — nền tảng là nơi gom hành trình, không bắt mọi người đăng một kiểu.",
        },
        {
          title: "Đối tượng",
          body: "Người muốn mở nghề, nhượng quyền nhỏ, sáng tạo sản phẩm, gây quỹ nhân đạo, hoặc chỉ cần một hồ sơ dự án sạch để cộng đồng tin.",
        },
        {
          title: "Giá trị cốt lõi",
          body: "Minh bạch dòng tiền, rõ ràng hoàn/giữ, giấy chứng nhận khi cho đi, hàng hóa khi nhận lại.",
        },
      ],
    },
    {
      kicker: "Mô hình lai",
      title: "Hai nhánh trên một nền tảng",
      cards: [
        {
          title: "Từ thiện / Quyên góp",
          body: "Cho đi vì mục đích nhân đạo. Không nhận lại lợi ích tài chính hay vật chất lớn. Backer nhận giấy chứng nhận ủng hộ TT-UH.",
          tone: "rose",
        },
        {
          title: "Nhận quà tri ân (Reward)",
          body: "Sản phẩm mẫu, hiện vật lưu niệm, hàng có sẵn hoặc pre-order. Về bản chất giao dịch, giống bán hàng trên Shopee / Lazada: có hàng, có giao, có biên lai, có hoàn khi không giao.",
          tone: "emerald",
        },
      ],
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Mẫu giấy chứng nhận ủng hộ TT-UH",
          caption: "Donation: giấy chứng nhận ủng hộ (mẫu minh họa TT-UH).",
        },
        {
          key: "bien-lai-thanh-toan.jpg",
          alt: "Mẫu biên lai thanh toán Reward",
          caption: "Reward: biên lai thanh toán nội bộ — cùng logic chứng từ bán hàng, không pretends hóa đơn GTGT.",
        },
      ],
    },
    {
      kicker: "Giữ tiền và hoàn tiền",
      title: "All-or-Nothing và Keep-It-All",
      body: "Thời hạn chiến dịch gây quỹ thường khoảng 2 tháng. Hàng hóa có nút xác nhận giao kể cả khi chưa đạt goal.",
      table: {
        headers: ["Mô hình", "Donation (không quà)", "Reward / pre-order / có giao hàng"],
        rows: [
          [
            "All-or-Nothing",
            "Hết hạn mà không đạt goal → hoàn toàn bộ.",
            "Có nút xác nhận giao kể cả khi chưa đạt goal. Nếu creator trễ hơn 2 ngày không gửi đơn vị vận chuyển → hủy và hoàn.",
          ],
          [
            "Keep-It-All",
            "Không đạt goal vẫn giữ tiền ủng hộ.",
            "Vẫn hoàn khi không giao hàng cho đơn vị vận chuyển đúng hẹn.",
          ],
        ],
      },
    },
    {
      kicker: "Luồng hàng Reward",
      title: "Giữ tiền trung gian, giao đúng hẹn",
      steps: [
        { n: "01", t: "Đặt / ủng hộ", d: "Thanh toán vào tài khoản trung gian (PayOS / VietQR)." },
        { n: "02", t: "Giữ tiền", d: "Escrow. Chưa giải ngân khi chưa đủ điều kiện mô hình." },
        { n: "03", t: "Xác nhận gửi ĐVVC", d: "Hạn 2 ngày sau mốc giao. Trễ → hủy + hoàn." },
        { n: "04", t: "Giao / khiếu nại", d: "Backer theo dõi trong Kho đồ và trang giao dịch." },
      ],
      figures: [
        {
          key: "bien-lai-thanh-toan.jpg",
          alt: "Biên lai sau khi thanh toán Reward thành công",
          caption: "Sau khi thanh toán thành công, backer có biên lai để đối chiếu — giống trải nghiệm mua trên sàn.",
        },
      ],
    },
    {
      kicker: "Chứng từ & giao dịch",
      title: "Donation có giấy, Reward có kho",
      cards: [
        {
          title: "Giấy TT-UH",
          body: "Quyên góp không nhận quà: cấp chứng nhận ủng hộ sau khi đối soát tiền vào tài khoản trung gian. Xem tại /chung-tu/[mã].",
        },
        {
          title: "Kho đồ /purchases",
          body: "Quà số, giấy chứng nhận, đơn đang chờ. Một chỗ để backer thấy mình đã ủng hộ / đặt gì.",
        },
        {
          title: "Tra cứu /lookup",
          body: "Người dùng xem các giao dịch: trạng thái thanh toán, hoàn tiền, giải ngân.",
        },
      ],
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Giấy chứng nhận ủng hộ TT-UH",
          caption: "Mẫu chứng nhận điện tử: mã TT-UH, số tiền, chiến dịch, mộc và QR xác thực.",
        },
        {
          key: "kho-do.jpg",
          alt: "Giao diện Kho đồ của backer",
          caption: "Kho đồ gom chứng nhận, vé/quà số và trạng thái đơn — sổ giao dịch của người dùng.",
        },
      ],
    },
    {
      kicker: "Pháp lý",
      title: "Nêu mô hình trước khi đăng ký công ty",
      paragraphs: [
        {
          lead: "Reward",
          text: "được trình bày như bán hàng trên sàn TMĐT (Shopee, Lazada): có hàng, có giá, có giao, có hóa đơn/thuế theo tư cách người bán. Nền tảng là trung gian, không phải bên bán.",
        },
        {
          lead: "Donation",
          text: "không phải góp vốn, không phải cổ phần. Người ủng hộ nhận giấy chứng nhận, không nhận lợi nhuận.",
        },
        {
          text: "Hướng đăng ký tương lai: công ty cung cấp dịch vụ TMĐT / sàn trung gian kết nối và giữ tiền — không sàn chứng khoán, không huy động vốn đại chúng, không sàn token.",
        },
      ],
      note: "NĐ 93 chỉ áp khi làm từ thiện đúng phạm vi được cấp phép. Chứng nhận / biên lai sàn là chứng từ đối chiếu, không phải hóa đơn GTGT. Trang này mô tả mô hình sản phẩm, không phải tư vấn luật.",
      figures: [
        {
          key: "chung-nhan-tt-uh.jpg",
          alt: "Chứng nhận donation",
          caption: "Pháp lý Donation: giấy chứng nhận ủng hộ.",
        },
        {
          key: "bien-lai-thanh-toan.jpg",
          alt: "Biên lai Reward",
          caption: "Pháp lý Reward: biên lai / chứng từ bán hàng trung gian.",
        },
      ],
    },
    {
      kicker: "Thị trường",
      title: "Quốc tế đã có, Việt Nam còn khoảng trống",
      cards: [
        {
          title: "Quốc tế",
          body: "Kickstarter: All-or-Nothing + Reward. Indiegogo: AoN hoặc Keep-It-All. GoFundMe: donation, giữ tiền. BackerKit: giao hàng sau chiến dịch.",
        },
        {
          title: "Việt Nam",
          body: "Gây quỹ trên mạng xã hội, pre-order trên Shopee/Lazada, một số kênh từ thiện. Chưa có nền tảng lai đủ: donation có chứng từ + reward có escrow + hồ sơ dự án.",
        },
        {
          title: "Điểm mạnh",
          body: "Hai nhánh rõ pháp lý, thanh toán nội địa, kho đồ, blog/video trên cùng hồ sơ creator.",
        },
        {
          title: "Điểm yếu",
          body: "Thương hiệu mới, tin cậy phải xây bằng KYC và minh bạch. Không cạnh tranh logistic với sàn lớn — phải hợp tác.",
        },
      ],
    },
    {
      kicker: "Khách hàng nhắm đến",
      title: "Ai dùng, vì sao dùng",
      bullets: [
        "Người trẻ / người lớn muốn bắt đầu một sự nghiệp nhỏ: quán, sản phẩm, khóa học, nhượng quyền.",
        "Người cần cộng đồng và thương hiệu cá nhân, không chỉ một đơn hàng rời.",
        "Người muốn lưu trữ quá trình làm dự án chuyên nghiệp: cập nhật, blog, video, chứng từ.",
        "Backer muốn vừa ủng hộ thiện nguyện vừa đặt trước có kiểm soát hoàn tiền.",
      ],
    },
    {
      kicker: "Case",
      title: "Khai trương quán gà rán nhượng quyền",
      body: "Nếu chỉ chạy khai trương kiểu truyền thống, bạn chỉ gặp khách quanh khu, người đi ngang bỏ lỡ, người bận ngày đó không quay lại. Chạy nhiều ngày thì dư hoặc thiếu hàng. Trên nền tảng: biết số đặt trước, người đã mua vé vẫn ghé ngày khác.",
      blocks: [
        {
          heading: "1. Chạy truyền thống — bán kính nhỏ",
          headingTone: "rose",
          figures: [
            {
              key: "ga-ran-truyen-thong.jpg",
              alt: "Khai trương quán gà rán chỉ tiếp cận khách quanh khu",
              caption: "Khách đứng ngay cửa tiệm. Xe máy, ô tô đi ngang bỏ lỡ. Người bận hôm đó coi như mất.",
            },
          ],
          bullets: [
            "Chỉ khách quanh khu vực.",
            "Không biết đủ / dư / thiếu hàng ngày đầu.",
            "Phải chạy nhiều ngày → hao nguồn lực chuẩn bị.",
          ],
        },
        {
          heading: "2. Chạy trên Tử Tế Fund — đặt trước, ghé sau",
          headingTone: "emerald",
          figures: [
            {
              key: "ga-ran-nen-tang.jpg",
              alt: "Khách đặt trước trên nền tảng trải khắp thành phố",
              caption: "Bản đồ khách pre-order trải nhiều quận. Vé trên điện thoại vẫn có giá trị những ngày sau khai trương.",
            },
            {
              key: "ve-uu-dai.jpg",
              alt: "Vé ưu đãi khai trương trên điện thoại",
              caption: "Người bận ngày khai trương vẫn giữ vé đã mua — họ sẽ ghé ngày khác để nhận ưu đãi.",
            },
          ],
        },
        {
          heading: "3. Quy mô tiếp cận",
          headingTone: "navy",
          figures: [
            {
              key: "ban-do-quy-mo.jpg",
              alt: "So sánh bán kính truyền thống với phủ điểm đặt trước trên toàn thành phố",
              caption: "Trái: vòng 1 km quanh quán. Phải: điểm khách đã trả tiền trước — tiếp cận xa hơn, lượng hàng tính được.",
            },
          ],
          cards: [
            {
              title: "Tối ưu chi phí",
              body: "Biết số combo đặt trước → nhập đúng nguyên liệu ngày đầu, không dư khay, không cháy hàng.",
            },
            {
              title: "Khách lâu dài",
              body: "Vé đã mua là lý do quay lại. Không phải chỉ một buổi khai trương rồi quên.",
            },
          ],
        },
      ],
    },
    {
      kicker: "Công ty tương lai",
      title: "Đăng ký gì, không đăng ký gì",
      cards: [
        {
          title: "Hướng đăng ký",
          body: "Công ty TNHH cung cấp nền tảng TMĐT / dịch vụ trung gian thanh toán và kết nối creator — backer. Website công bố mô hình Donation vs Reward như trên.",
        },
        {
          title: "Không pretends",
          body: "Không quỹ từ thiện đã cấp phép nếu chưa có. Không sàn vốn. Không token. Reward kê khai như bán hàng; Donation kê như ủng hộ có chứng nhận.",
        },
      ],
    },
    {
      variant: "close",
      title: "Một nền tảng để bắt đầu tử tế",
      body: "Cho đi thì có giấy. Nhận lại thì có hàng. Không đủ goal thì rõ hoàn hay giữ. Không đối đầu sàn lớn — mượn họ để kể chuyện, rồi đưa người về hồ sơ dự án của mình.",
      figures: [
        {
          key: "donation-reward.jpg",
          alt: "Tóm tắt hai nhánh Donation và Reward",
          caption: "Hai nhánh, một hồ sơ dự án.",
        },
      ],
    },
  ],
};
