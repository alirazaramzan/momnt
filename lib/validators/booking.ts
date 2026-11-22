import { z } from "zod";
import type { ActionResult } from "./profile";

/**
 * Availability and booking zod schemas + date/time parsing helpers.
 *
 * Server actions validate all client inputs with these schemas. Prices and
 * deposits are never accepted from the browser; they are always derived on
 * the server from the selected package row in `public.packages`.
 */

export const AVAILABILITY_STATUSES = [
  "available",
  "booked",
  "unavailable",
] as const;

export type AvailabilityStatusValue = (typeof AVAILABILITY_STATUSES)[number];

export const BOOKING_EVENT_OPTIONS = [
  "Mehndi",
  "Barat",
  "Walima",
  "Nikah",
  "Portrait session",
  "Corporate event",
  "Weddings",
  "Portraits",
  "Editorial",
  "Corporate",
  "Traditional events",
] as const;

const MONTH_LOOKUP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

/**
 * Parses either an ISO date string ("2026-12-14") or a human date string
 * ("14 December", "14 Dec", "14-Dec", "14 December 2026") into "YYYY-MM-DD",
 * or `null` if invalid.
 */
export function parseFlexibleDateToIso(
  raw: string | null | undefined,
  defaultYear: number = new Date().getUTCFullYear()
): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;

  // 1. ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (
      !Number.isNaN(dt.getTime()) &&
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    ) {
      return trimmed;
    }
    return null;
  }

  // 2. "14 December", "14-Dec", "14 Dec 2026"
  const dmY = trimmed.match(
    /^(\d{1,2})[\s,-]+([A-Za-z]{3,9})(?:[\s,-]+(\d{4}))?$/
  );
  if (dmY) {
    const day = Number(dmY[1]);
    const monthNum = MONTH_LOOKUP[dmY[2].toLowerCase()];
    const year = dmY[3] ? Number(dmY[3]) : defaultYear;
    if (monthNum && day >= 1 && day <= 31 && year >= 2024 && year <= 2100) {
      const dt = new Date(Date.UTC(year, monthNum - 1, day));
      if (
        !Number.isNaN(dt.getTime()) &&
        dt.getUTCFullYear() === year &&
        dt.getUTCMonth() === monthNum - 1 &&
        dt.getUTCDate() === day
      ) {
        return `${year}-${String(monthNum).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      }
    }
  }

  // 3. "December 14, 2026" or "Dec 14"
  const mdY = trimmed.match(
    /^([A-Za-z]{3,9})[\s,-]+(\d{1,2})(?:[\s,-]+(\d{4}))?$/
  );
  if (mdY) {
    const monthNum = MONTH_LOOKUP[mdY[1].toLowerCase()];
    const day = Number(mdY[2]);
    const year = mdY[3] ? Number(mdY[3]) : defaultYear;
    if (monthNum && day >= 1 && day <= 31 && year >= 2024 && year <= 2100) {
      const dt = new Date(Date.UTC(year, monthNum - 1, day));
      if (
        !Number.isNaN(dt.getTime()) &&
        dt.getUTCFullYear() === year &&
        dt.getUTCMonth() === monthNum - 1 &&
        dt.getUTCDate() === day
      ) {
        return `${year}-${String(monthNum).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      }
    }
  }

  return null;
}

/**
 * Parses either a 24-hour time ("18:00", "18:00:00") or 12-hour time
 * ("6:00 pm", "6 pm", "11:30 am") into "HH:MM:00", or `null` if invalid.
 */
export function parseFlexibleTimeToSql(
  raw: string | null | undefined
): string | null {
  const trimmed = (raw ?? "").trim().toLowerCase();
  if (!trimmed) return null;

  // "6:00 pm to midnight" -> take start part before "to" or "-"
  const firstPart = trimmed.split(/\s+(?:to|-|–)\s+/)[0]?.trim() || trimmed;

  // 24-hour HH:MM or HH:MM:SS
  const m24 = firstPart.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (m24) {
    const hh = Number(m24[1]);
    const mm = Number(m24[2]);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  }

  // 12-hour e.g. "6:00 pm", "6pm", "12:30 am"
  const m12 = firstPart.match(/^(\d{1,2})(?::([0-5]\d))?\s*(am|pm)$/);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = m12[2] ? Number(m12[2]) : 0;
    const meridiem = m12[3];
    if (hh < 1 || hh > 12) return null;
    if (meridiem === "am") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
  }

  return null;
}

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

const FULL_MONTHS = [
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

export function formatIsoDateHuman(
  isoDate: string | null | undefined,
  style: "short" | "long" = "long"
): string {
  if (!isoDate) return "";
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const year = Number(m[1]);
  const monthIdx = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIdx < 0 || monthIdx > 11) return isoDate;
  if (style === "short") {
    return `${day} ${SHORT_MONTHS[monthIdx]} ${year}`;
  }
  return `${day} ${FULL_MONTHS[monthIdx]} ${year}`;
}

export function formatSqlTimeHuman(
  sqlTime: string | null | undefined
): string {
  if (!sqlTime) return "6:00 pm";
  const m = sqlTime.match(/^(\d{2}):(\d{2})/);
  if (!m) return sqlTime;
  const hh24 = Number(m[1]);
  const mm = m[2];
  const meridiem = hh24 >= 12 ? "pm" : "am";
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${hh12}:${mm} ${meridiem}`;
}

const isoDateField = (message: string) =>
  z
    .string({ error: message })
    .trim()
    .transform((val) => parseFlexibleDateToIso(val) ?? "")
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      error: message,
    });

const optionalPositiveInt = (message: string, max: number) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const trimmed = typeof val === "string" ? val.trim() : val;
      if (trimmed === "") return null;
      return Number(trimmed);
    })
    .refine(
      (val) =>
        val === null ||
        (Number.isInteger(val) && val >= 1 && val <= max),
      { error: message }
    );

const requiredPositiveInt = (message: string, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? val.trim() : val))
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      error: message,
    })
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ error: message })
        .int({ error: message })
        .min(1, { error: message })
        .max(max, { error: `Enter ${max.toLocaleString()} or fewer` })
    );

const optionalText = (max: number) =>
  z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ?? "").trim())
    .pipe(z.string().max(max, { error: `Use ${max} characters or fewer` }))
    .transform((val) => (val === "" ? null : val));

// ---------------------------------------------------------------------------
// 1. Availability schemas (Prompt 6.1)
// ---------------------------------------------------------------------------

export const setAvailabilityDateSchema = z.object({
  date: isoDateField("Select a valid calendar date"),
  status: z.enum(AVAILABILITY_STATUSES, {
    error: "Choose available, booked, or unavailable",
  }),
});

export const setAvailabilityBatchSchema = z.object({
  dates: z
    .array(isoDateField("Select valid calendar dates"))
    .min(1, { error: "Select at least one date on the calendar" })
    .max(62, { error: "Select up to 62 dates at a time" })
    .transform((list) => Array.from(new Set(list))),
  status: z.enum(AVAILABILITY_STATUSES, {
    error: "Choose available, booked, or unavailable",
  }),
});

export type SetAvailabilityDateInput = z.input<typeof setAvailabilityDateSchema>;
export type SetAvailabilityBatchInput = z.input<typeof setAvailabilityBatchSchema>;

// ---------------------------------------------------------------------------
// 2. Booking submission schema (Prompt 6.2)
// ---------------------------------------------------------------------------

export const createBookingRequestSchema = z.object({
  photographer_id: z.uuid({ error: "Choose a verified photographer" }),
  package_id: z.uuid({ error: "Select a photography package" }),
  event_type: z
    .string({ error: "Select an event type" })
    .trim()
    .min(2, { error: "Select an event type" })
    .max(80, { error: "Use 80 characters or fewer" }),
  event_date: isoDateField("Enter a valid date (for example 2026-12-14)"),
  start_time: z
    .string({ error: "Enter event start time" })
    .trim()
    .transform((val) => parseFlexibleTimeToSql(val) ?? "")
    .refine((val) => /^\d{2}:\d{2}:00$/.test(val), {
      error: "Enter a start time like 6:00 pm or 18:00",
    }),
  location: z
    .string({ error: "Enter venue or area" })
    .trim()
    .min(2, { error: "Enter venue or area" })
    .max(200, { error: "Use 200 characters or fewer" }),
  duration_hours: optionalPositiveInt(
    "Enter duration between 1 and 168 hours",
    168
  ),
  guests: requiredPositiveInt("Enter estimated guest count (at least 1)", 20000),
  budget: optionalPositiveInt(
    "Enter a positive whole PKR budget",
    50_000_000
  ),
  requirements: optionalText(2000),
});

export type CreateBookingRequestInput = z.input<
  typeof createBookingRequestSchema
>;
export type CreateBookingField = keyof CreateBookingRequestInput;

// ---------------------------------------------------------------------------
// 3. Booking status transition & counter-proposal schemas (Prompt 6.2)
// ---------------------------------------------------------------------------

export const transitionBookingStatusSchema = z.object({
  booking_id: z.uuid({ error: "Select a valid booking" }),
  next_status: z.enum(
    [
      "requested",
      "accepted",
      "deposit_paid",
      "shoot_done",
      "delivered",
      "completed",
      "rejected",
      "cancelled",
    ] as const,
    { error: "Choose a valid booking status" }
  ),
  note: optionalText(500),
});

export const proposeBookingChangeSchema = z
  .object({
    booking_id: z.uuid({ error: "Select a valid booking" }),
    proposed_date: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        const trimmed = (val ?? "").trim();
        if (!trimmed) return null;
        return parseFlexibleDateToIso(trimmed) ?? "__invalid__";
      })
      .refine((val) => val !== "__invalid__", {
        error: "Enter a valid proposed date",
      }),
    proposed_package_id: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        const trimmed = (val ?? "").trim();
        return trimmed === "" ? null : trimmed;
      })
      .refine(
        (val) =>
          val === null ||
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            val
          ),
        { error: "Select one of your packages" }
      ),
    proposal_note: optionalText(500),
  })
  .refine(
    (data) => data.proposed_date !== null || data.proposed_package_id !== null,
    {
      error: "Choose a new date, a different package, or both to propose",
      path: ["proposed_date"],
    }
  );

export const acceptBookingProposalSchema = z.object({
  booking_id: z.uuid({ error: "Select a valid booking" }),
});

export type TransitionBookingStatusInput = z.input<
  typeof transitionBookingStatusSchema
>;
export type ProposeBookingChangeInput = z.input<
  typeof proposeBookingChangeSchema
>;
export type ProposeBookingField = keyof ProposeBookingChangeInput;

export interface CreatedBookingSummary {
  id: string;
  event_type: string;
  event_date: string;
  start_time: string;
  location: string;
  duration_hours: number;
  guests: number;
  budget: number | null;
  requirements: string | null;
  package_id: string;
  package_name: string;
  price: number;
  deposit_amount: number;
  status: "requested";
}

export type CreateBookingResult =
  | { ok: true; booking: CreatedBookingSummary }
  | ({ ok: false } & Extract<ActionResult<CreateBookingField>, { ok: false }>);

