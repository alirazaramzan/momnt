import "server-only";
import { z } from "zod";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { createClient } from "@/lib/supabase/server";
import type {
  Package,
  PlaceholderTone,
  PortfolioItem,
  VerificationStatus,
} from "@/lib/types";
import {
  formatDeliveryDays,
  parsePackageAddons,
} from "@/lib/validators/packages";
import { SPECIALISATIONS, STYLES } from "@/lib/validators/profile";

export const SEARCH_PAGE_SIZE = 12;
export const MAX_COMPARE_PHOTOGRAPHERS = 3;

export const SEARCH_CITIES = ["Karachi", "Lahore", "Islamabad"] as const;
export const SEARCH_BUDGET_PRESETS = [
  "all",
  "under_75k",
  "75k_150k",
  "above_150k",
] as const;
export const SEARCH_ROLES = ["all", "photographer", "videographer"] as const;
export const SEARCH_SORTS = [
  "rating",
  "price_asc",
  "price_desc",
  "newest",
] as const;

export type SearchBudgetPreset = (typeof SEARCH_BUDGET_PRESETS)[number];
export type SearchRole = (typeof SEARCH_ROLES)[number];
export type SearchSort = (typeof SEARCH_SORTS)[number];

const TONES: PlaceholderTone[] = ["warm", "midnight", "slate", "dune"];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function firstParam(
  value: string | string[] | undefined | null
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

/**
 * Normalizes an event type filter or home-search event query (e.g. "Mehndi",
 * "Baraat", "Walima", "Nikah") into the canonical specialization name or "all".
 */
export function normalizeEventType(raw?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return "all";
  const lower = trimmed.toLowerCase();
  for (const spec of SPECIALISATIONS) {
    if (spec.toLowerCase() === lower) return spec;
  }
  if (
    ["mehndi", "baraat", "barat", "walima", "nikah", "nikkah", "wedding"].includes(
      lower
    )
  ) {
    return "Weddings";
  }
  return "all";
}

export function normalizeCity(raw?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return "all";
  const lower = trimmed.toLowerCase();
  for (const city of SEARCH_CITIES) {
    if (city.toLowerCase() === lower) return city;
  }
  return "all";
}

export function normalizeStyle(raw?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return "all";
  const lower = trimmed.toLowerCase();
  for (const st of STYLES) {
    if (st.toLowerCase() === lower) return st;
  }
  return "all";
}

/**
 * Parses either an ISO date ("2026-12-14") or short human date ("14 Dec",
 * "14 Dec 2026") into "YYYY-MM-DD", or "" if invalid / empty.
 */
export function normalizeAvailableDate(raw?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? "" : trimmed;
  }

  const shortMatch = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]{3,9})(?:[\s-]+(\d{4}))?$/);
  if (shortMatch) {
    const day = Number(shortMatch[1]);
    const monthPrefix = shortMatch[2].slice(0, 3).toLowerCase();
    const year = shortMatch[3] ? Number(shortMatch[3]) : new Date().getUTCFullYear();
    const monthIndex = SHORT_MONTHS.findIndex(
      (m) => m.toLowerCase() === monthPrefix
    );
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const d = new Date(`${iso}T00:00:00Z`);
      if (!Number.isNaN(d.getTime()) && d.getUTCDate() === day) {
        return iso;
      }
    }
  }

  return "";
}

export function formatShortDateLabel(isoDate: string | null | undefined): string {
  if (!isoDate) return "Available";
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const monthIdx = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIdx < 0 || monthIdx > 11) return isoDate;
  return `${day} ${SHORT_MONTHS[monthIdx]}`;
}

const optionalBudgetInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined || val === "") return null;
    const n = typeof val === "number" ? val : Number(String(val).trim());
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.min(Math.round(n), 50_000_000);
  });

export const photographerSearchInputSchema = z.object({
  city: z.string().optional(),
  eventType: z.string().optional(),
  style: z.string().optional(),
  budget: z.string().optional(),
  minBudget: optionalBudgetInt,
  maxBudget: optionalBudgetInt,
  role: z.string().optional(),
  availableDate: z.string().optional(),
  verifiedOnly: z.boolean().default(true),
  sort: z.string().optional(),
  page: z
    .union([z.string(), z.number(), z.undefined()])
    .transform((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 ? Math.min(n, 1000) : 1;
    }),
  compareIds: z.array(z.string()).default([]),
});

export interface PhotographerSearchFilters {
  city: string;
  eventType: string;
  style: string;
  budget: SearchBudgetPreset;
  minBudget: number | null;
  maxBudget: number | null;
  role: SearchRole;
  availableDate: string; // YYYY-MM-DD or ""
  verifiedOnly: boolean;
  sort: SearchSort;
  page: number;
  compareIds: string[];
}

export interface SearchPhotographerItem {
  id: string;
  name: string;
  city: string;
  avatarSrc?: string;
  bio?: string;
  specialisations: string[];
  styles: string[];
  yearsExperience: number | null;
  isVideographer: boolean;
  role: "photographer" | "videographer" | "both";
  verified: boolean;
  status: VerificationStatus;
  startingPrice: number;
  packageCount: number;
  packages: Package[];
  rating: number;
  reviewCount: number;
  nextFree: string;
  nextFreeIso: string | null;
  portfolio: PortfolioItem[];
  createdAt: string;
}

export interface SearchPhotographersResult {
  filters: PhotographerSearchFilters;
  items: SearchPhotographerItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  comparedPhotographers: SearchPhotographerItem[];
}

/**
 * Validates and normalizes raw URL searchParams into typed search filters.
 */
export function parseSearchFilters(
  rawParams: Record<string, string | string[] | undefined>
): PhotographerSearchFilters {
  const rawVerified = firstParam(rawParams.verified) ?? firstParam(rawParams.verifiedOnly);
  const verifiedOnly =
    rawVerified === undefined
      ? true
      : rawVerified !== "false" && rawVerified !== "0";

  const rawCompare = firstParam(rawParams.compare) ?? "";
  const compareIds = Array.from(
    new Set(
      rawCompare
        .split(",")
        .map((s) => s.trim())
        .filter((id) => UUID_REGEX.test(id) || id.startsWith("ph-"))
    )
  ).slice(0, MAX_COMPARE_PHOTOGRAPHERS);

  const parsed = photographerSearchInputSchema.safeParse({
    city: firstParam(rawParams.city),
    eventType: firstParam(rawParams.eventType) ?? firstParam(rawParams.event),
    style: firstParam(rawParams.style),
    budget: firstParam(rawParams.budget),
    minBudget: firstParam(rawParams.minBudget) ?? firstParam(rawParams.min),
    maxBudget: firstParam(rawParams.maxBudget) ?? firstParam(rawParams.max),
    role: firstParam(rawParams.role),
    availableDate:
      firstParam(rawParams.date) ?? firstParam(rawParams.availableDate),
    verifiedOnly,
    sort: firstParam(rawParams.sort) ?? firstParam(rawParams.sortBy),
    page: firstParam(rawParams.page),
    compareIds,
  });

  const data = parsed.success
    ? parsed.data
    : {
        city: undefined,
        eventType: undefined,
        style: undefined,
        budget: undefined,
        minBudget: null,
        maxBudget: null,
        role: undefined,
        availableDate: undefined,
        verifiedOnly: true,
        sort: undefined,
        page: 1,
        compareIds: [],
      };

  const city = normalizeCity(data.city);
  const eventType = normalizeEventType(data.eventType);
  const style = normalizeStyle(data.style);

  const rawBudget = (data.budget ?? "all").trim();
  const budget: SearchBudgetPreset = (
    SEARCH_BUDGET_PRESETS as readonly string[]
  ).includes(rawBudget)
    ? (rawBudget as SearchBudgetPreset)
    : "all";

  let minBudget = data.minBudget;
  let maxBudget = data.maxBudget;

  // Apply budget preset bounds when explicit min/max are not supplied
  if (minBudget === null && maxBudget === null) {
    if (budget === "under_75k") {
      maxBudget = 74_999;
    } else if (budget === "75k_150k") {
      minBudget = 75_000;
      maxBudget = 150_000;
    } else if (budget === "above_150k") {
      minBudget = 150_001;
    }
  }

  if (minBudget !== null && maxBudget !== null && minBudget > maxBudget) {
    const tmp = minBudget;
    minBudget = maxBudget;
    maxBudget = tmp;
  }

  const rawRole = (data.role ?? "all").trim().toLowerCase();
  const role: SearchRole = (SEARCH_ROLES as readonly string[]).includes(rawRole)
    ? (rawRole as SearchRole)
    : "all";

  const rawSort = (data.sort ?? "rating").trim();
  const sort: SearchSort = (SEARCH_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as SearchSort)
    : "rating";

  const availableDate = normalizeAvailableDate(data.availableDate);

  return {
    city,
    eventType,
    style,
    budget,
    minBudget,
    maxBudget,
    role,
    availableDate,
    verifiedOnly: data.verifiedOnly,
    sort,
    page: data.page,
    compareIds: data.compareIds,
  };
}

interface RawSearchRow {
  id: string;
  full_name: string;
  city: string;
  avatar_url: string | null;
  bio: string | null;
  specializations: string[];
  styles: string[];
  years_experience: number | null;
  is_videographer: boolean;
  verification_status: VerificationStatus;
  is_verified: boolean;
  starting_price: number | null;
  package_count: number;
  packages: unknown;
  rating: number | string;
  review_count: number;
  portfolio_preview: unknown;
  next_free_date: string | null;
  created_at: string;
  total_count?: number | string;
}

function mapRawRowToItem(
  row: RawSearchRow,
  getPublicPortfolioUrl: (storagePath: string) => string | undefined
): SearchPhotographerItem {
  const rawPackages = Array.isArray(row.packages) ? row.packages : [];
  const packages: Package[] = rawPackages.map((item, idx) => {
    const p = (item ?? {}) as Record<string, unknown>;
    const deliveryDays =
      typeof p.delivery_days === "number" ? p.delivery_days : 14;
    return {
      id: typeof p.id === "string" ? p.id : `pkg-${idx}`,
      name: typeof p.name === "string" ? p.name : "Coverage package",
      price: typeof p.price === "number" ? p.price : 0,
      hours: typeof p.hours === "number" ? p.hours : 4,
      photographers:
        typeof p.num_photographers === "number" ? p.num_photographers : 1,
      editedPhotos: typeof p.edited_photos === "number" ? p.edited_photos : 0,
      deliveryDays,
      deliveryTime: formatDeliveryDays(deliveryDays),
      addons: parsePackageAddons(p.addons),
    };
  });

  const rawPortfolio = Array.isArray(row.portfolio_preview)
    ? row.portfolio_preview
    : [];
  const portfolio: PortfolioItem[] = rawPortfolio.map((item, index) => {
    const img = (item ?? {}) as Record<string, unknown>;
    const storagePath =
      typeof img.storage_path === "string" ? img.storage_path : "";
    const caption = typeof img.caption === "string" ? img.caption : "";
    return {
      id: typeof img.id === "string" ? img.id : `${row.id}-port-${index}`,
      tone: TONES[index % TONES.length],
      caption,
      number: String(index + 1).padStart(3, "0"),
      event: caption || row.specializations[0] || "Frame",
      aperture: index === 0 ? "f/1.8" : index === 1 ? "f/1.4" : "f/2.0",
      aspect: "1/1",
      credit: row.full_name,
      src: storagePath ? getPublicPortfolioUrl(storagePath) : undefined,
    };
  });

  // Pad to 3 placeholder frames when a photographer has fewer than 3 uploaded images
  while (portfolio.length < 3) {
    const idx = portfolio.length;
    portfolio.push({
      id: `${row.id}-placeholder-${idx}`,
      tone: TONES[idx % TONES.length],
      caption: row.specializations[idx % Math.max(1, row.specializations.length)] || "Session",
      number: String(idx + 1).padStart(3, "0"),
      event: row.specializations[idx % Math.max(1, row.specializations.length)] || "Session",
      aperture: idx === 0 ? "f/1.8" : idx === 1 ? "f/1.4" : "f/2.0",
      aspect: "1/1",
      credit: row.full_name,
    });
  }

  const startingPrice =
    typeof row.starting_price === "number"
      ? row.starting_price
      : packages.length > 0
      ? Math.min(...packages.map((p) => p.price))
      : 0;

  return {
    id: row.id,
    name: row.full_name,
    city: row.city,
    avatarSrc: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    specialisations: row.specializations ?? [],
    styles: row.styles ?? [],
    yearsExperience: row.years_experience,
    isVideographer: Boolean(row.is_videographer),
    role: row.is_videographer ? "videographer" : "photographer",
    verified: Boolean(row.is_verified),
    status: row.verification_status,
    startingPrice,
    packageCount: row.package_count ?? packages.length,
    packages,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    nextFree: formatShortDateLabel(row.next_free_date),
    nextFreeIso: row.next_free_date,
    portfolio,
    createdAt: row.created_at,
  };
}

/**
 * Fallback mapper from `MOCK_PHOTOGRAPHERS` only when the database has zero
 * photographer profiles seeded yet.
 */
function searchMockFallback(
  filters: PhotographerSearchFilters
): SearchPhotographersResult {
  const allItems: SearchPhotographerItem[] = MOCK_PHOTOGRAPHERS.map((ph, idx) => {
    const startingPrice =
      ph.packages.length > 0
        ? Math.min(...ph.packages.map((p) => p.price))
        : 0;
    return {
      id: ph.id,
      name: ph.name,
      city: ph.city,
      avatarSrc: ph.avatarSrc,
      bio: ph.bio,
      specialisations: ph.specialisations,
      styles: ph.styles,
      yearsExperience: ph.yearsExperience ?? 5 + idx,
      isVideographer: ph.role === "videographer" || ph.role === "both",
      role: ph.role ?? "photographer",
      verified: ph.verified,
      status: ph.status,
      startingPrice,
      packageCount: ph.packages.length,
      packages: ph.packages,
      rating: ph.rating,
      reviewCount: ph.reviewStats?.reviewCount ?? 3,
      nextFree: ph.nextFree,
      nextFreeIso: normalizeAvailableDate(ph.nextFree) || null,
      portfolio: ph.portfolio,
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)).toISOString(),
    };
  });

  const filtered = allItems
    .filter((ph) => {
      if (filters.verifiedOnly && !ph.verified) return false;
      if (
        filters.city !== "all" &&
        ph.city.toLowerCase() !== filters.city.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.eventType !== "all" &&
        !ph.specialisations.some(
          (s) => s.toLowerCase() === filters.eventType.toLowerCase()
        )
      ) {
        return false;
      }
      if (
        filters.style !== "all" &&
        !ph.styles.some((s) => s.toLowerCase() === filters.style.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.minBudget !== null &&
        ph.startingPrice < filters.minBudget
      ) {
        return false;
      }
      if (
        filters.maxBudget !== null &&
        ph.startingPrice > filters.maxBudget
      ) {
        return false;
      }
      if (filters.role === "videographer" && !ph.isVideographer) return false;
      if (filters.role === "photographer" && ph.isVideographer) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.startingPrice - b.startingPrice;
      if (filters.sort === "price_desc") return b.startingPrice - a.startingPrice;
      if (filters.sort === "newest")
        return b.createdAt.localeCompare(a.createdAt);
      return b.rating - a.rating;
    });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / SEARCH_PAGE_SIZE));
  const safePage = Math.min(filters.page, totalPages);
  const start = (safePage - 1) * SEARCH_PAGE_SIZE;
  const items = filtered.slice(start, start + SEARCH_PAGE_SIZE);
  const comparedPhotographers = filters.compareIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is SearchPhotographerItem => Boolean(item));

  return {
    filters: { ...filters, page: safePage },
    items,
    totalCount,
    page: safePage,
    pageSize: SEARCH_PAGE_SIZE,
    totalPages,
    comparedPhotographers,
  };
}

/**
 * Loads up to 3 photographers by ID for the comparison drawer/modal.
 */
export async function loadPhotographersForComparison(
  ids: string[]
): Promise<SearchPhotographerItem[]> {
  const validUuids = Array.from(
    new Set(ids.map((id) => id.trim()).filter((id) => UUID_REGEX.test(id)))
  ).slice(0, MAX_COMPARE_PHOTOGRAPHERS);

  if (validUuids.length === 0) {
    const mockMatches = ids
      .slice(0, MAX_COMPARE_PHOTOGRAPHERS)
      .map((id) => MOCK_PHOTOGRAPHERS.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (mockMatches.length === 0) return [];
    return searchMockFallback(
      parseSearchFilters({ compare: ids.join(","), verified: "false" })
    ).comparedPhotographers;
  }

  const supabase = await createClient();
  const portfolioBucket = supabase.storage.from("portfolio");
  const getPublicPortfolioUrl = (storagePath: string) =>
    portfolioBucket.getPublicUrl(storagePath).data.publicUrl;

  const { data, error } = await supabase.rpc("get_photographers_for_compare", {
    p_ids: validUuids,
  });

  if (error || !data) {
    return [];
  }

  return (data as unknown as RawSearchRow[]).map((row) =>
    mapRawRowToItem(row, getPublicPortfolioUrl)
  );
}

/**
 * Server search function for `/photographers`.
 * Calls the `public.search_photographers` RPC function for fast single-query
 * filtering, sorting, and 12-per-page pagination, and loads any selected
 * photographers (up to 3) for the comparison view.
 */
export async function searchPhotographers(
  rawParams: Record<string, string | string[] | undefined>
): Promise<SearchPhotographersResult> {
  const filters = parseSearchFilters(rawParams);
  const supabase = await createClient();
  const portfolioBucket = supabase.storage.from("portfolio");
  const getPublicPortfolioUrl = (storagePath: string) =>
    portfolioBucket.getPublicUrl(storagePath).data.publicUrl;

  const rpcArgs = {
    p_city: filters.city === "all" ? undefined : filters.city,
    p_event_type: filters.eventType === "all" ? undefined : filters.eventType,
    p_style: filters.style === "all" ? undefined : filters.style,
    p_min_budget: filters.minBudget ?? undefined,
    p_max_budget: filters.maxBudget ?? undefined,
    p_role: filters.role === "all" ? undefined : filters.role,
    p_available_date: filters.availableDate || undefined,
    p_verified_only: filters.verifiedOnly,
    p_sort: filters.sort,
    p_page: filters.page,
    p_page_size: SEARCH_PAGE_SIZE,
  };

  const [searchRes, compareItems] = await Promise.all([
    supabase.rpc("search_photographers", rpcArgs),
    filters.compareIds.length > 0
      ? loadPhotographersForComparison(filters.compareIds)
      : Promise.resolve([]),
  ]);

  if (searchRes.error) {
    return searchMockFallback(filters);
  }

  const rows = (searchRes.data ?? []) as unknown as RawSearchRow[];
  const totalCount =
    rows.length > 0 ? Number(rows[0].total_count ?? rows.length) : 0;

  // If the requested page is past the last page (e.g. after narrowing filters),
  // clamp to page 1 and re-fetch if needed.
  if (rows.length === 0 && filters.page > 1) {
    return searchPhotographers({
      ...rawParams,
      page: "1",
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / SEARCH_PAGE_SIZE));
  const items = rows.map((row) => mapRawRowToItem(row, getPublicPortfolioUrl));

  return {
    filters,
    items,
    totalCount,
    page: filters.page,
    pageSize: SEARCH_PAGE_SIZE,
    totalPages,
    comparedPhotographers: compareItems,
  };
}

