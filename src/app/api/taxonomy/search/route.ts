import { NextResponse } from "next/server";
import type { MainCategory } from "@/types/taxonomy";
import { TAXONOMY_DATA } from "@/data/taxonomy";
import { searchTagsInCategory } from "@/lib/taxonomy-helpers";

/**
 * GET /api/taxonomy/search?q=query&category=category
 * Search tags within a category or globally
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category") as MainCategory | null;
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Query parameter 'q' is required",
        },
        { status: 400 }
      );
    }
    
    let results;
    
    if (category) {
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
      
      // Search within category
      results = searchTagsInCategory(query, category);
    } else {
      // Search globally
      const lowerQuery = query.toLowerCase().trim();
      results = TAXONOMY_DATA.allStarterTags.filter(
        (tag) =>
          tag.label.toLowerCase().includes(lowerQuery) ||
          tag.id.toLowerCase().includes(lowerQuery)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        category: category || "all",
        results,
        count: results.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search tags",
      },
      { status: 500 }
    );
  }
}
