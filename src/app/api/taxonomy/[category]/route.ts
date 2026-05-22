import { NextResponse } from "next/server";
import type { MainCategory } from "@/types/taxonomy";
import { TAXONOMY_DATA } from "@/data/taxonomy";
import {
  getAllowedTagGroups,
  getStarterTagsForCategory,
  getRecommendedStarterTags,
  getTagGroupsWithTags,
} from "@/lib/taxonomy-helpers";

/**
 * GET /api/taxonomy/:category
 * Returns taxonomy data for a specific category
 */
export async function GET(
  request: Request,
  context: { params: Promise<Promise<{ category: string> }> }
) {
  try {
    const { category: rawCategory } = await params;
    const category = decodeURIComponent(rawCategory) as MainCategory;

    // Validate category
    if (!TAXONOMY_DATA.mainCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category",
          validCategories: TAXONOMY_DATA.mainCategories,
        },
        { status: 400 }
      );
    }

    const categoryTaxonomy = TAXONOMY_DATA.starterTagsByCategory[category];
    const allowedTagGroups = getAllowedTagGroups(category);
    const allTags = getStarterTagsForCategory(category);
    const recommendedTags = getRecommendedStarterTags(category);
    const tagGroupsWithTags = getTagGroupsWithTags(category);

    return NextResponse.json({
      success: true,
      data: {
        category,
        allowedTagGroups,
        recommendedStarterTags: recommendedTags,
        disallowedStarterTags: categoryTaxonomy.disallowedStarterTags,
        tagGroups: tagGroupsWithTags,
        stats: {
          totalTags: allTags.length,
          totalGroups: allowedTagGroups.length,
          recommendedCount: recommendedTags.length,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category taxonomy",
      },
      { status: 500 }
    );
  }
}
