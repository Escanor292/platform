import { NextResponse } from "next/server";
import { TAXONOMY_DATA } from "@/data/taxonomy";
import { getTaxonomyStats } from "@/lib/taxonomy-helpers";

/**
 * GET /api/taxonomy
 * Returns taxonomy overview
 */
export async function GET() {
  try {
    const stats = getTaxonomyStats();
    
    return NextResponse.json({
      success: true,
      data: {
        mainCategories: TAXONOMY_DATA.mainCategories,
        tagGroups: [
          "Loại nội dung",
          "Định dạng phát hành",
          "Mục đích / Phong cách",
          "Loại sản phẩm",
          "Công nghệ / Kỹ thuật",
          "Giai đoạn phát triển",
          "Mô hình / Vận hành",
          "Đối tượng hưởng lợi",
          "Phạm vi",
          "Thời gian",
        ],
        stats: {
          totalCategories: stats.totalCategories,
          totalTags: stats.totalTags,
          tagsByCategory: stats.tagsByCategory,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch taxonomy data",
      },
      { status: 500 }
    );
  }
}
