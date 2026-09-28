import type { PresentationDeck } from "@/lib/admin-presentation-types";
import { BUSINESS_SLIDES_A } from "@/lib/admin-presentation-seed-business-a";
import { BUSINESS_SLIDES_B } from "@/lib/admin-presentation-seed-business-b";
import { BUSINESS_SLIDES_C } from "@/lib/admin-presentation-seed-business-c";

/** Bump khi sửa nội dung slide — deck active trên Postgres sẽ được ghi đè payload. */
export const PRESENTATION_SEED_VERSION = 40;

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
  slides: [...BUSINESS_SLIDES_A, ...BUSINESS_SLIDES_B, ...BUSINESS_SLIDES_C],
};
