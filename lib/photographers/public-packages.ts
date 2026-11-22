import "server-only";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { partyName } from "@/lib/profiles/display";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  Package,
  Photographer,
  PhotographerAvailabilitySummary,
  PhotographerReviewItem,
  PlaceholderTone,
  PortfolioItem,
} from "@/lib/types";
import {
  formatDeliveryDays,
  parsePackageAddons,
} from "@/lib/validators/packages";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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

const TONES: PlaceholderTone[] = ["warm", "midnight", "slate", "dune"];

function mapDbPackages(
  rows: Array<{
    id: string;
    name: string;
    price: number;
    hours: number;
    num_photographers: number;
    edited_photos: number;
    delivery_days: number;
    addons: unknown;
  }>
): Package[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    hours: row.hours,
    photographers: row.num_photographers,
    editedPhotos: row.edited_photos,
    deliveryTime: formatDeliveryDays(row.delivery_days),
    deliveryDays: row.delivery_days,
    addons: parsePackageAddons(row.addons),
    price: row.price,
  }));
}

function parseSocialLinks(raw: unknown): {
  instagram?: string;
  facebook?: string;
  website?: string;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  return {
    instagram: typeof obj.instagram === "string" ? obj.instagram : undefined,
    facebook: typeof obj.facebook === "string" ? obj.facebook : undefined,
    website: typeof obj.website === "string" ? obj.website : undefined,
  };
}

/**
 * Builds the current (or target) month calendar summary from `availability`
 * rows where status is `booked` or `unavailable`.
 */
export function buildAvailabilitySummary(
  rows: Array<{ date: string; status: string }>,
  referenceDate: Date = new Date()
): { summary: PhotographerAvailabilitySummary; nextFreeLabel: string } {
  const year = referenceDate.getUTCFullYear();
  const monthIndex = referenceDate.getUTCMonth(); // 0..11
  const todayDay = referenceDate.getUTCDate();
  const monthName = MONTH_NAMES[monthIndex];
  const shortMonth = SHORT_MONTHS[monthIndex];

  // Number of days in month
  const daysCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  // Day of week of the 1st: JS getUTCDay() is 0 (Sun)..6 (Sat). MonthCalendar uses 0 (Mon)..6 (Sun).
  const firstDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const firstDayOffset = (firstDow + 6) % 7;

  const ymPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const bookedSet = new Set<number>();
  for (const row of rows) {
    if (
      (row.status === "booked" || row.status === "unavailable") &&
      row.date.startsWith(ymPrefix)
    ) {
      const dayNum = Number(row.date.slice(ymPrefix.length));
      if (Number.isInteger(dayNum) && dayNum >= 1 && dayNum <= daysCount) {
        bookedSet.add(dayNum);
      }
    }
  }

  const bookedDates = Array.from(bookedSet).sort((a, b) => a - b);

  // Pick the first free day starting from today (or from day 1 if all remaining days are booked)
  let defaultSelectedDate: number | null = null;
  for (let d = todayDay; d <= daysCount; d++) {
    if (!bookedSet.has(d)) {
      defaultSelectedDate = d;
      break;
    }
  }
  if (defaultSelectedDate === null) {
    for (let d = 1; d < todayDay; d++) {
      if (!bookedSet.has(d)) {
        defaultSelectedDate = d;
        break;
      }
    }
  }

  const nextFreeLabel = defaultSelectedDate
    ? `${defaultSelectedDate} ${shortMonth}`
    : `Fully booked in ${shortMonth}`;

  return {
    summary: {
      month: monthName,
      year,
      daysCount,
      firstDayOffset,
      bookedDates,
      defaultSelectedDate,
    },
    nextFreeLabel,
  };
}

function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Server loader for `/photographers/[id]` and `/book/[photographerId]`.
 *
 * - Reads real `photographer_profiles`, `portfolio_images`, `packages`,
 *   `availability`, and `reviews` from Supabase.
 * - Enforces visibility:
 *   * If the photographer does not exist -> returns `null` (caller triggers 404).
 *   * If the photographer is not `verified`, only the owner or an `admin` can
 *     view the profile (RLS on `photographer_profiles` already hides unverified
 *     rows from everyone else, returning `null` -> 404).
 * - For legacy mock demo slugs (`ph-sara-khan`, etc.), returns the matching
 *   mock photographer if found and verified, or `null` for any unknown slug
 *   (never silently falling back to Sara Khan for invalid IDs).
 */
export async function loadPublicPhotographerWithPackages(
  idOrSlug: string
): Promise<Photographer | null> {
  const supabase = await createClient();

  if (UUID_REGEX.test(idOrSlug)) {
    // 1. Read photographer_profiles via the viewer's session client so RLS
    //    applies: public sees verified only; owner and admin see all statuses.
    const { data: phRow, error: phError } = await supabase
      .from("photographer_profiles")
      .select(
        "profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status"
      )
      .eq("profile_id", idOrSlug)
      .maybeSingle();

    if (phError || !phRow) {
      return null;
    }

    // Double-check viewer authorization when unverified
    const isVerified = phRow.verification_status === "verified";
    if (!isVerified) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      if (user.id !== phRow.profile_id) {
        const { data: viewerProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (viewerProfile?.role !== "admin") {
          return null;
        }
      }
    }

    // 2. Load portfolio_images, packages, availability, and reviews in parallel
    const now = new Date();
    const year = now.getUTCFullYear();
    const monthIndex = now.getUTCMonth();
    const monthStart = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const monthEnd = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
      daysInMonth
    ).padStart(2, "0")}`;

    const [portfolioRes, pkgRes, availRes, reviewsRes] = await Promise.all([
      supabase
        .from("portfolio_images")
        .select("id, storage_path, caption, sort_order")
        .eq("photographer_id", idOrSlug)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("packages")
        .select(
          "id, name, price, hours, num_photographers, edited_photos, delivery_days, addons"
        )
        .eq("photographer_id", idOrSlug)
        .order("price", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("availability")
        .select("date, status")
        .eq("photographer_id", idOrSlug)
        .gte("date", monthStart)
        .lte("date", monthEnd),
      supabase
        .from("reviews")
        .select("id, reviewer_id, rating, comment, created_at")
        .eq("photographer_id", idOrSlug)
        .order("created_at", { ascending: false }),
    ]);

    // 3. Resolve safe public display fields (photographer name, city, avatar,
    //    and reviewer display names).
    let fullName = "Momnt photographer";
    let city = "Pakistan";
    let avatarSrc: string | undefined;
    const reviewerNames = new Map<string, string | null>();

    try {
      const admin = createAdminClient();
      const reviewerIds = Array.from(
        new Set(
          (reviewsRes.data ?? [])
            .map((r) => r.reviewer_id)
            .filter((rid): rid is string => Boolean(rid))
        )
      );

      const idsToLookup = Array.from(new Set([idOrSlug, ...reviewerIds]));
      const { data: profileRows } = await admin
        .from("profiles")
        .select("id, full_name, city, avatar_url")
        .in("id", idsToLookup);

      for (const row of profileRows ?? []) {
        if (row.id === idOrSlug) {
          fullName = row.full_name?.trim() || fullName;
          city = row.city?.trim() || city;
          avatarSrc = row.avatar_url ?? undefined;
        }
        reviewerNames.set(row.id, row.full_name);
      }
    } catch {
      // Fallback if service role key is unavailable
    }

    // 4. Map portfolio images with public Storage URLs
    const portfolioBucket = supabase.storage.from("portfolio");
    const portfolio: PortfolioItem[] = (portfolioRes.data ?? []).map(
      (img, index) => ({
        id: img.id,
        tone: TONES[index % TONES.length],
        caption: img.caption ?? "",
        number: String(index + 1).padStart(3, "0"),
        aspect: index === 0 ? "3/2" : "4/3",
        credit: fullName,
        src: portfolioBucket.getPublicUrl(img.storage_path).data.publicUrl,
      })
    );

    // 5. Map packages
    const packages = mapDbPackages(pkgRes.data ?? []);

    // 6. Build availability summary
    const { summary: availabilitySummary, nextFreeLabel } =
      buildAvailabilitySummary(availRes.data ?? [], now);

    // 7. Compute review stats (average rating and count; can be 0)
    const rawReviews = reviewsRes.data ?? [];
    const reviewCount = rawReviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round(
            (rawReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
              reviewCount) *
              10
          ) / 10
        : 0;

    const reviews: PhotographerReviewItem[] = rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment?.trim() || "",
      reviewerName: partyName(
        r.reviewer_id,
        r.reviewer_id ? reviewerNames.get(r.reviewer_id) : null
      ),
      dateLabel: formatReviewDate(r.created_at),
    }));

    return {
      id: phRow.profile_id,
      name: fullName,
      city,
      avatarSrc,
      bio: phRow.bio ?? undefined,
      specialisations: phRow.specializations,
      styles: phRow.styles,
      verified: isVerified,
      status: phRow.verification_status,
      rating: averageRating,
      replyTime: "within the hour",
      packages,
      portfolio,
      nextFree: nextFreeLabel,
      role: phRow.is_videographer ? "both" : "photographer",
      yearsExperience: phRow.years_experience,
      socialLinks: parseSocialLinks(phRow.social_links),
      availabilitySummary,
      reviewStats: {
        averageRating,
        reviewCount,
      },
      reviews,
      isPreviewForOwnerOrAdmin: !isVerified,
    };
  }

  // Legacy mock photographer lookup (only matches explicit mock IDs)
  const mock =
    MOCK_PHOTOGRAPHERS.find((p) => p.id === idOrSlug) ||
    MOCK_PHOTOGRAPHERS.find((p) => p.id === `ph-${idOrSlug}`) ||
    null;

  if (!mock || !mock.verified) {
    return null;
  }

  return {
    ...mock,
    availabilitySummary: mock.availabilitySummary ?? {
      month: "December",
      year: 2026,
      daysCount: 31,
      firstDayOffset: 1,
      bookedDates: [4, 5, 11, 12, 19, 26],
      defaultSelectedDate: 14,
    },
    reviewStats: mock.reviewStats ?? {
      averageRating: mock.rating,
      reviewCount: 3,
    },
  };
}
