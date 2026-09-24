import type { PresentationSlide } from "@/lib/admin-presentation-types";
import { ACADEMIC_SLIDES_1 } from "@/lib/admin-presentation-academic-1";
import { ACADEMIC_SLIDES_2 } from "@/lib/admin-presentation-academic-2";
import { ACADEMIC_SLIDES_4 } from "@/lib/admin-presentation-academic-4";
import { ACADEMIC_SLIDES_3 } from "@/lib/admin-presentation-academic-3";

export const ACADEMIC_SLIDES: PresentationSlide[] = [
  ...ACADEMIC_SLIDES_1,
  ...ACADEMIC_SLIDES_2,
  ...ACADEMIC_SLIDES_4,
  ...ACADEMIC_SLIDES_3,
];
