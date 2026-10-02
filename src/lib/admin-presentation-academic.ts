import type { PresentationSlide } from "@/lib/admin-presentation-types";
import { ACADEMIC_SLIDES_1 } from "@/lib/admin-presentation-academic-1";
import { ACADEMIC_SLIDES_2 } from "@/lib/admin-presentation-academic-2";
import { ACADEMIC_SLIDES_4 } from "@/lib/admin-presentation-academic-4";
import { ACADEMIC_SLIDES_3 } from "@/lib/admin-presentation-academic-3";
import { PROPOSAL_SLIDES } from "@/lib/admin-presentation-proposal";

/** 20 slide kinh doanh, phụ lục học thuật 21–54, rồi 14 slide giới thiệu. */
export const ACADEMIC_SLIDES: PresentationSlide[] = [
  ...ACADEMIC_SLIDES_1,
  ...ACADEMIC_SLIDES_2,
  ...ACADEMIC_SLIDES_4,
  ...ACADEMIC_SLIDES_3,
  ...PROPOSAL_SLIDES,
];
