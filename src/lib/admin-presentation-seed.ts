import type { PresentationDeck } from "@/lib/admin-presentation-types";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 38;

export const PRESENTATION_MEDIA_FILES = [
  "chung-nhan-tt-uh.jpg",
  "bien-lai-thanh-toan.jpg",
  "donation-reward.jpg",
  "ga-ran-truyen-thong.jpg",
  "ga-ran-nen-tang.jpg",
  "ban-do-quy-mo.jpg",
  "kho-do.jpg",
  "ve-uu-dai.jpg",
  "usecase-tute.png",
  "flow-guest-backer.png",
  "flow-creator-admin.png",
  "activity-checkout.png",
] as const;

export const DEFAULT_PRESENTATION_DECK: PresentationDeck = {
  version: PRESENTATION_SEED_VERSION,
  brand: "Tử Tế Fund · Thuyết trình nội bộ",
  title: "Mô hình lai Donation + Reward",
  slides: [
    {
      variant: "hero",
      kicker: "Tử Tế Fund",
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
  ],
};
