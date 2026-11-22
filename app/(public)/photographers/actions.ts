"use server";

import {
  loadPhotographersForComparison,
  type SearchPhotographerItem,
} from "@/lib/search/photographers";

/**
 * Server action to load up to 3 photographers by ID for the comparison view.
 */
export async function fetchComparePhotographersAction(
  ids: string[]
): Promise<SearchPhotographerItem[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return loadPhotographersForComparison(ids);
}

