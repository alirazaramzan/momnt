/**
 * Demo seed script for Momnt (scripts/seed.ts).
 *
 * Seeds realistic dummy data (never real personal data):
 *   - 15 photographers across Lahore (5), Karachi (5), and Islamabad (5)
 *     with packages, availability, placeholder portfolio images, and fake CNIC
 *     verification requests (13 verified, 1 under_review, 1 pending)
 *   - 5 clients across Karachi, Lahore, and Islamabad
 *   - 1 agency ("Atelier Noor Events")
 *   - 1 admin ("Ahsan Raza")
 *   - 10 gigs with 22 bids across statuses (submitted, shortlisted, awarded, rejected)
 *   - 17 bookings across all statuses (requested, accepted, deposit_paid,
 *     shoot_done, delivered, completed, rejected, cancelled) + client reviews
 *
 * Also writes an idempotent `supabase/seed.sql` for `supabase db reset`.
 *
 * Run with:
 *   npm run db:seed
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";

const DEMO_PASSWORD = "MomntDemoPassword123!";

// Deterministic UUID helper: prefix (8 hex) + group (4 hex) + index (12 hex)
const uid = (group: string, index: number) =>
  `d0000000-${group.padStart(4, "0")}-4000-8000-${String(index).padStart(12, "0")}`;

const ADMIN = {
  id: uid("0001", 1),
  email: "admin.demo@momnt.example",
  full_name: "Ahsan Raza",
  city: "Karachi",
  phone: "0300 0000001",
  role: "admin" as const,
};

const CLIENTS = [
  { id: uid("0002", 1), email: "amina.demo@momnt.example", full_name: "Amina Tariq", city: "Karachi", phone: "0300 0000101" },
  { id: uid("0002", 2), email: "hamza.demo@momnt.example", full_name: "Hamza Qureshi", city: "Lahore", phone: "0300 0000102" },
  { id: uid("0002", 3), email: "sana.demo@momnt.example", full_name: "Sana Mehmood", city: "Islamabad", phone: "0300 0000103" },
  { id: uid("0002", 4), email: "daniyal.demo@momnt.example", full_name: "Daniyal Farooq", city: "Karachi", phone: "0300 0000104" },
  { id: uid("0002", 5), email: "mahnoor.demo@momnt.example", full_name: "Mahnoor Javed", city: "Lahore", phone: "0300 0000105" },
];

const AGENCY = {
  id: uid("0003", 1),
  email: "atelier.noor.demo@momnt.example",
  full_name: "Zeeshan Haider",
  business_name: "Atelier Noor Events",
  city: "Karachi",
  phone: "0300 0000201",
  role: "agency" as const,
};

interface SeedPhotographer {
  index: number;
  id: string;
  email: string;
  full_name: string;
  city: "Karachi" | "Lahore" | "Islamabad";
  phone: string;
  bio: string;
  specializations: string[];
  styles: string[];
  years_experience: number;
  is_videographer: boolean;
  verification_status: "verified" | "under_review" | "pending";
  created_at: string;
  packages: Array<{
    id: string;
    name: string;
    price: number;
    hours: number;
    num_photographers: number;
    edited_photos: number;
    delivery_days: number;
    addons: Array<{ name: string; price: number }>;
  }>;
  captions: string[];
  booked_days_dec: number[];
  unavailable_days_dec: number[];
}

const PHOTOGRAPHERS: SeedPhotographer[] = [
  // KARACHI (5)
  {
    index: 1,
    id: uid("0004", 1),
    email: "sara.khan.demo@momnt.example",
    full_name: "Sara Khan",
    city: "Karachi",
    phone: "0301 0000301",
    bio: "Documentary wedding and portrait photographer based in Karachi. Working with available light and unhurried pacing.",
    specializations: ["Weddings", "Portraits"],
    styles: ["Documentary", "Natural light", "Editorial"],
    years_experience: 7,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-01T10:00:00Z",
    packages: [
      { id: uid("0005", 101), name: "Portrait session", price: 45000, hours: 2, num_photographers: 1, edited_photos: 45, delivery_days: 10, addons: [{ name: "Fine art print set", price: 15000 }] },
      { id: uid("0005", 102), name: "Mehndi coverage", price: 120000, hours: 6, num_photographers: 2, edited_photos: 250, delivery_days: 21, addons: [{ name: "Extra hour", price: 18000 }] },
      { id: uid("0005", 103), name: "Full wedding", price: 240000, hours: 12, num_photographers: 3, edited_photos: 500, delivery_days: 28, addons: [{ name: "Linen photo album", price: 35000 }] },
    ],
    captions: ["Mehndi entrance", "Window light portrait", "Rooftop golden hour", "Stage preparations"],
    booked_days_dec: [4, 5, 11, 12, 19, 26],
    unavailable_days_dec: [27],
  },
  {
    index: 2,
    id: uid("0004", 2),
    email: "omar.siddiqui.demo@momnt.example",
    full_name: "Omar Siddiqui",
    city: "Karachi",
    phone: "0301 0000302",
    bio: "Classic event photography across Karachi. Focused on key family moments and formal stage portraits.",
    specializations: ["Weddings", "Traditional events"],
    styles: ["Classic", "Documentary"],
    years_experience: 9,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-03T10:00:00Z",
    packages: [
      { id: uid("0005", 201), name: "Half day event", price: 85000, hours: 5, num_photographers: 1, edited_photos: 200, delivery_days: 14, addons: [{ name: "Second shooter", price: 25000 }] },
      { id: uid("0005", 202), name: "Full wedding", price: 180000, hours: 10, num_photographers: 2, edited_photos: 400, delivery_days: 21, addons: [{ name: "Printed family album", price: 30000 }] },
    ],
    captions: ["Baraat arrivals", "Stage family portrait", "Courtyard arrival"],
    booked_days_dec: [6, 13, 14, 20],
    unavailable_days_dec: [21],
  },
  {
    index: 3,
    id: uid("0004", 3),
    email: "zainab.raza.demo@momnt.example",
    full_name: "Zainab Raza",
    city: "Karachi",
    phone: "0301 0000303",
    bio: "Editorial fashion and wedding documentarian capturing genuine interactions and quiet details on stills and motion.",
    specializations: ["Editorial", "Portraits", "Weddings"],
    styles: ["Editorial", "Natural light"],
    years_experience: 6,
    is_videographer: true,
    verification_status: "verified",
    created_at: "2026-10-05T10:00:00Z",
    packages: [
      { id: uid("0005", 301), name: "Intimate Nikah & short film", price: 95000, hours: 4, num_photographers: 2, edited_photos: 160, delivery_days: 14, addons: [{ name: "Super-8 style reel", price: 22000 }] },
      { id: uid("0005", 302), name: "Editorial wedding story", price: 210000, hours: 10, num_photographers: 3, edited_photos: 380, delivery_days: 28, addons: [] },
    ],
    captions: ["Morning light dupatta", "Mirrored reflection", "Evening candid conversation"],
    booked_days_dec: [15, 18, 25],
    unavailable_days_dec: [],
  },
  {
    index: 4,
    id: uid("0004", 4),
    email: "kamran.baig.demo@momnt.example",
    full_name: "Kamran Baig",
    city: "Karachi",
    phone: "0301 0000304",
    bio: "Corporate portrait and conference photographer working with executive teams and publications in Karachi.",
    specializations: ["Corporate", "Portraits"],
    styles: ["Classic", "Editorial"],
    years_experience: 11,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-07T10:00:00Z",
    packages: [
      { id: uid("0005", 401), name: "Executive headshot session", price: 40000, hours: 2, num_photographers: 1, edited_photos: 25, delivery_days: 5, addons: [{ name: "On-site lighting setup", price: 12000 }] },
      { id: uid("0005", 402), name: "Annual summit full day", price: 115000, hours: 8, num_photographers: 2, edited_photos: 220, delivery_days: 7, addons: [] },
    ],
    captions: ["Boardroom portrait", "Keynote stage frame", "Harbour office daylight"],
    booked_days_dec: [10, 17],
    unavailable_days_dec: [24],
  },
  {
    index: 5,
    id: uid("0004", 5),
    email: "nadia.haroon.demo@momnt.example",
    full_name: "Nadia Haroon",
    city: "Karachi",
    phone: "0301 0000305",
    bio: "Wedding filmmaker and director producing narrative multi-day wedding films across Karachi.",
    specializations: ["Weddings", "Traditional events"],
    styles: ["Cinematic", "Documentary"],
    years_experience: 8,
    is_videographer: true,
    verification_status: "verified",
    created_at: "2026-10-09T10:00:00Z",
    packages: [
      { id: uid("0005", 501), name: "Mehndi highlight film", price: 165000, hours: 6, num_photographers: 2, edited_photos: 60, delivery_days: 21, addons: [{ name: "Drone aerial unit", price: 25000 }] },
      { id: uid("0005", 502), name: "Three-day wedding cinema", price: 340000, hours: 18, num_photographers: 3, edited_photos: 150, delivery_days: 35, addons: [] },
    ],
    captions: ["Dholki courtyard lanterns", "Bridal procession frame", "Coastal sunset couple reel"],
    booked_days_dec: [12, 14, 19],
    unavailable_days_dec: [20],
  },

  // LAHORE (5)
  {
    index: 6,
    id: uid("0004", 6),
    email: "hira.anwar.demo@momnt.example",
    full_name: "Hira Anwar",
    city: "Lahore",
    phone: "0301 0000306",
    bio: "Fine art wedding and editorial photographer working between Lahore heritage venues and private gardens.",
    specializations: ["Weddings", "Editorial"],
    styles: ["Fine art", "Natural light"],
    years_experience: 6,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-11T10:00:00Z",
    packages: [
      { id: uid("0005", 601), name: "Nikah & portraits", price: 70000, hours: 4, num_photographers: 1, edited_photos: 180, delivery_days: 14, addons: [{ name: "Archival print box", price: 20000 }] },
      { id: uid("0005", 602), name: "Full wedding celebration", price: 195000, hours: 12, num_photographers: 2, edited_photos: 450, delivery_days: 28, addons: [] },
    ],
    captions: ["Courtyard daylight", "Heirloom jewelry detail", "Bridal portrait by candlelight"],
    booked_days_dec: [5, 19, 22],
    unavailable_days_dec: [23],
  },
  {
    index: 7,
    id: uid("0004", 7),
    email: "bilal.shah.demo@momnt.example",
    full_name: "Bilal Shah",
    city: "Lahore",
    phone: "0301 0000307",
    bio: "Cinematographer and visual storyteller specializing in documentary wedding films and live cultural performances.",
    specializations: ["Weddings", "Traditional events"],
    styles: ["Documentary", "Cinematic"],
    years_experience: 10,
    is_videographer: true,
    verification_status: "verified",
    created_at: "2026-10-13T10:00:00Z",
    packages: [
      { id: uid("0005", 701), name: "Cinematic wedding film", price: 160000, hours: 8, num_photographers: 2, edited_photos: 40, delivery_days: 28, addons: [{ name: "Same-week teaser cut", price: 30000 }] },
      { id: uid("0005", 702), name: "Two-day film & stills", price: 290000, hours: 16, num_photographers: 3, edited_photos: 300, delivery_days: 35, addons: [] },
    ],
    captions: ["Night entrance teaser", "Shehnai performance", "Stage dance frame"],
    booked_days_dec: [14, 16, 24],
    unavailable_days_dec: [],
  },
  {
    index: 8,
    id: uid("0004", 8),
    email: "faisal.butt.demo@momnt.example",
    full_name: "Faisal Butt",
    city: "Lahore",
    phone: "0301 0000308",
    bio: "Experienced family wedding photographer covering traditional ceremonies across Lahore and Gulberg.",
    specializations: ["Weddings", "Traditional events"],
    styles: ["Classic", "Natural light"],
    years_experience: 12,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-15T10:00:00Z",
    packages: [
      { id: uid("0005", 801), name: "Barat & stage coverage", price: 90000, hours: 6, num_photographers: 2, edited_photos: 260, delivery_days: 14, addons: [] },
      { id: uid("0005", 802), name: "Complete two-day wedding", price: 175000, hours: 12, num_photographers: 3, edited_photos: 520, delivery_days: 21, addons: [{ name: "Two parent albums", price: 28000 }] },
    ],
    captions: ["Haveli courtyard welcome", "Walima family group", "Garden pavilion portrait"],
    booked_days_dec: [7, 14, 21],
    unavailable_days_dec: [28],
  },
  {
    index: 9,
    id: uid("0004", 9),
    email: "mehwish.lone.demo@momnt.example",
    full_name: "Mehwish Lone",
    city: "Lahore",
    phone: "0301 0000309",
    bio: "Studio and location portrait photographer working with bridal ateliers, designers and creative founders in Lahore.",
    specializations: ["Portraits", "Editorial"],
    styles: ["Fine art", "Editorial"],
    years_experience: 5,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-18T10:00:00Z",
    packages: [
      { id: uid("0005", 901), name: "Lookbook half day", price: 55000, hours: 4, num_photographers: 1, edited_photos: 60, delivery_days: 7, addons: [{ name: "Studio backdrop kit", price: 15000 }] },
      { id: uid("0005", 902), name: "Campaign full day", price: 110000, hours: 8, num_photographers: 2, edited_photos: 140, delivery_days: 10, addons: [] },
    ],
    captions: ["Silk drape study", "Terrace shadow portrait", "Atelier fitting room"],
    booked_days_dec: [9, 18],
    unavailable_days_dec: [],
  },
  {
    index: 10,
    id: uid("0004", 10),
    email: "salman.virk.demo@momnt.example",
    full_name: "Salman Virk",
    city: "Lahore",
    phone: "0301 0000310",
    bio: "Corporate event and cultural videographer in Lahore. New member awaiting initial document verification.",
    specializations: ["Corporate", "Traditional events"],
    styles: ["Documentary", "Classic"],
    years_experience: 3,
    is_videographer: true,
    verification_status: "pending",
    created_at: "2026-11-10T10:00:00Z",
    packages: [
      { id: uid("0005", 1001), name: "Conference video & stills", price: 60000, hours: 5, num_photographers: 1, edited_photos: 80, delivery_days: 10, addons: [] },
      { id: uid("0005", 1002), name: "Corporate documentary day", price: 125000, hours: 8, num_photographers: 2, edited_photos: 120, delivery_days: 14, addons: [] },
    ],
    captions: ["Auditorium panel", "Qawali night stage", "Exhibition floor"],
    booked_days_dec: [11],
    unavailable_days_dec: [],
  },

  // ISLAMABAD (5)
  {
    index: 11,
    id: uid("0004", 11),
    email: "tariq.malik.demo@momnt.example",
    full_name: "Tariq Malik",
    city: "Islamabad",
    phone: "0301 0000311",
    bio: "Commercial and environmental portrait photographer. Verification documents currently under review by Momnt team.",
    specializations: ["Portraits", "Corporate"],
    styles: ["Documentary", "Classic"],
    years_experience: 4,
    is_videographer: false,
    verification_status: "under_review",
    created_at: "2026-11-08T10:00:00Z",
    packages: [
      { id: uid("0005", 1101), name: "Executive portrait session", price: 50000, hours: 3, num_photographers: 1, edited_photos: 30, delivery_days: 5, addons: [] },
      { id: uid("0005", 1102), name: "Conference full day", price: 105000, hours: 7, num_photographers: 2, edited_photos: 180, delivery_days: 7, addons: [] },
    ],
    captions: ["Studio portrait", "Executive boardroom", "Workspace ambient"],
    booked_days_dec: [15],
    unavailable_days_dec: [],
  },
  {
    index: 12,
    id: uid("0004", 12),
    email: "ayesha.khattak.demo@momnt.example",
    full_name: "Ayesha Khattak",
    city: "Islamabad",
    phone: "0301 0000312",
    bio: "Natural light wedding and portrait photographer in Islamabad, known for calm outdoor sessions in the Margalla hills.",
    specializations: ["Weddings", "Portraits"],
    styles: ["Natural light", "Fine art"],
    years_experience: 7,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-20T10:00:00Z",
    packages: [
      { id: uid("0005", 1201), name: "Margalla outdoor portraits", price: 48000, hours: 3, num_photographers: 1, edited_photos: 50, delivery_days: 7, addons: [] },
      { id: uid("0005", 1202), name: "Intimate Nikah day", price: 110000, hours: 6, num_photographers: 2, edited_photos: 240, delivery_days: 14, addons: [] },
      { id: uid("0005", 1203), name: "Full wedding story", price: 220000, hours: 12, num_photographers: 3, edited_photos: 480, delivery_days: 28, addons: [{ name: "Handbound linen album", price: 32000 }] },
    ],
    captions: ["Margalla ridge dusk", "Garden Nikah vows", "Pine forest couple walk"],
    booked_days_dec: [8, 18, 25],
    unavailable_days_dec: [26],
  },
  {
    index: 13,
    id: uid("0004", 13),
    email: "usman.gilani.demo@momnt.example",
    full_name: "Usman Gilani",
    city: "Islamabad",
    phone: "0301 0000313",
    bio: "Director of photography crafting cinematic wedding films and live event coverage across Islamabad and Northern Pakistan.",
    specializations: ["Weddings", "Traditional events"],
    styles: ["Cinematic", "Documentary"],
    years_experience: 8,
    is_videographer: true,
    verification_status: "verified",
    created_at: "2026-10-22T10:00:00Z",
    packages: [
      { id: uid("0005", 1301), name: "Walima film & stills", price: 155000, hours: 7, num_photographers: 2, edited_photos: 150, delivery_days: 21, addons: [] },
      { id: uid("0005", 1302), name: "Signature wedding cinema", price: 280000, hours: 14, num_photographers: 3, edited_photos: 280, delivery_days: 30, addons: [{ name: "4K documentary cut", price: 40000 }] },
    ],
    captions: ["Lawn lantern reception", "Hilltop vows frame", "String quartet evening"],
    booked_days_dec: [12, 19],
    unavailable_days_dec: [20],
  },
  {
    index: 14,
    id: uid("0004", 14),
    email: "rabia.abbasi.demo@momnt.example",
    full_name: "Rabia Abbasi",
    city: "Islamabad",
    phone: "0301 0000314",
    bio: "Editorial portrait and fine art photographer working with independent brands, artists and publications in Islamabad.",
    specializations: ["Editorial", "Portraits"],
    styles: ["Editorial", "Fine art"],
    years_experience: 5,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-10-25T10:00:00Z",
    packages: [
      { id: uid("0005", 1401), name: "Editorial portrait session", price: 65000, hours: 3, num_photographers: 1, edited_photos: 45, delivery_days: 7, addons: [] },
      { id: uid("0005", 1402), name: "Studio & outdoor lookbook", price: 130000, hours: 7, num_photographers: 2, edited_photos: 130, delivery_days: 14, addons: [] },
    ],
    captions: ["Concrete courtyard study", "Winter sun profile", "Ceramic studio portrait"],
    booked_days_dec: [10, 22],
    unavailable_days_dec: [],
  },
  {
    index: 15,
    id: uid("0004", 15),
    email: "haris.afridi.demo@momnt.example",
    full_name: "Haris Afridi",
    city: "Islamabad",
    phone: "0301 0000315",
    bio: "Documentary and classic event photographer covering diplomatic receptions, corporate forums and weddings in Islamabad.",
    specializations: ["Corporate", "Weddings"],
    styles: ["Classic", "Documentary"],
    years_experience: 9,
    is_videographer: false,
    verification_status: "verified",
    created_at: "2026-11-01T10:00:00Z",
    packages: [
      { id: uid("0005", 1501), name: "Diplomatic & summit event", price: 80000, hours: 5, num_photographers: 1, edited_photos: 180, delivery_days: 5, addons: [{ name: "Same-evening press selects", price: 20000 }] },
      { id: uid("0005", 1502), name: "Full wedding coverage", price: 170000, hours: 10, num_photographers: 2, edited_photos: 400, delivery_days: 21, addons: [] },
    ],
    captions: ["Embassy garden reception", "Forum keynote address", "Evening courtyard dinner"],
    booked_days_dec: [14, 23],
    unavailable_days_dec: [],
  },
];

// 10 Gigs with bids
const GIGS = [
  { id: uid("0007", 1), client_id: CLIENTS[0].id, title: "Intimate rooftop Mehndi in Clifton", event_type: "Weddings", event_date: "2026-12-16", city: "Karachi", hours: 6, budget_min: 100000, budget_max: 140000, description: "Looking for documentary coverage for 180 guests with natural warm lantern lighting.", bid_deadline: "2026-12-10T23:59:59Z", status: "open" as const },
  { id: uid("0007", 2), client_id: CLIENTS[1].id, title: "Two-day Barat & Walima in Gulberg", event_type: "Weddings", event_date: "2026-12-20", city: "Lahore", hours: 12, budget_min: 170000, budget_max: 230000, description: "Family-focused coverage across two evenings with both candid and formal family group portraits.", bid_deadline: "2026-12-12T23:59:59Z", status: "open" as const },
  { id: uid("0007", 3), client_id: CLIENTS[2].id, title: "Outdoor Nikah ceremony in F-7", event_type: "Weddings", event_date: "2026-12-19", city: "Islamabad", hours: 5, budget_min: 90000, budget_max: 130000, description: "Afternoon garden Nikah with 120 guests. Natural light portraits in the courtyard.", bid_deadline: "2026-12-11T23:59:59Z", status: "open" as const },
  { id: uid("0007", 4), client_id: AGENCY.id, title: "Winter bridal lookbook campaign", event_type: "Editorial", event_date: "2026-12-15", city: "Karachi", hours: 8, budget_min: 150000, budget_max: 220000, description: "Full-day heritage courtyard editorial shoot for a 14-piece bridal collection.", bid_deadline: "2026-12-05T23:59:59Z", status: "awarded" as const },
  { id: uid("0007", 5), client_id: CLIENTS[3].id, title: "Annual fintech leadership forum", event_type: "Corporate", event_date: "2026-12-22", city: "Karachi", hours: 7, budget_min: 90000, budget_max: 130000, description: "Keynote speakers, panel discussions, and executive headshots during breakout sessions.", bid_deadline: "2026-12-15T23:59:59Z", status: "open" as const },
  { id: uid("0007", 6), client_id: CLIENTS[4].id, title: "Haveli Qawali & Dholki night", event_type: "Traditional events", event_date: "2026-12-18", city: "Lahore", hours: 5, budget_min: 80000, budget_max: 120000, description: "Traditional evening gathering in old Lahore with live musicians.", bid_deadline: "2026-12-10T23:59:59Z", status: "open" as const },
  { id: uid("0007", 7), client_id: CLIENTS[2].id, title: "Founder & design team portraits", event_type: "Portraits", event_date: "2026-12-17", city: "Islamabad", hours: 3, budget_min: 45000, budget_max: 70000, description: "Clean natural light portraits for a 12-person architecture studio.", bid_deadline: "2026-12-09T23:59:59Z", status: "open" as const },
  { id: uid("0007", 8), client_id: AGENCY.id, title: "Three-day destination wedding film", event_type: "Weddings", event_date: "2026-12-27", city: "Lahore", hours: 16, budget_min: 250000, budget_max: 350000, description: "Seeking a dedicated cinematography team for a three-day family wedding.", bid_deadline: "2026-12-18T23:59:59Z", status: "open" as const },
  { id: uid("0007", 9), client_id: CLIENTS[0].id, title: "Family graduation garden dinner", event_type: "Portraits", event_date: "2026-12-23", city: "Karachi", hours: 3, budget_min: 40000, budget_max: 60000, description: "Relaxed evening family portraits at home in DHA.", bid_deadline: "2026-12-14T23:59:59Z", status: "open" as const },
  { id: uid("0007", 10), client_id: CLIENTS[1].id, title: "Autumn textile exhibition launch", event_type: "Editorial", event_date: "2026-11-15", city: "Lahore", hours: 4, budget_min: 55000, budget_max: 85000, description: "Gallery opening and textile detail photography.", bid_deadline: "2026-11-10T23:59:59Z", status: "closed" as const },
];

const BIDS = [
  // Gig 1
  { id: uid("0008", 1), gig_id: GIGS[0].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[1].id, price: 120000, status: "shortlisted" as const, message: "Available on 16 Dec. Includes two photographers and 250 edited frames." },
  { id: uid("0008", 2), gig_id: GIGS[0].id, photographer_id: PHOTOGRAPHERS[1].id, package_id: PHOTOGRAPHERS[1].packages[0].id, price: 95000, status: "submitted" as const, message: "Can cover the full 6-hour Mehndi with classic and candid coverage." },
  { id: uid("0008", 3), gig_id: GIGS[0].id, photographer_id: PHOTOGRAPHERS[4].id, package_id: PHOTOGRAPHERS[4].packages[0].id, price: 140000, status: "submitted" as const, message: "Happy to offer our Mehndi highlight film and stills package." },
  // Gig 2
  { id: uid("0008", 4), gig_id: GIGS[1].id, photographer_id: PHOTOGRAPHERS[5].id, package_id: PHOTOGRAPHERS[5].packages[1].id, price: 195000, status: "shortlisted" as const, message: "Two-photographer fine art coverage across both days in Gulberg." },
  { id: uid("0008", 5), gig_id: GIGS[1].id, photographer_id: PHOTOGRAPHERS[7].id, package_id: PHOTOGRAPHERS[7].packages[1].id, price: 175000, status: "submitted" as const, message: "12 years covering Lahore weddings; includes 520 edited photos." },
  // Gig 3
  { id: uid("0008", 6), gig_id: GIGS[2].id, photographer_id: PHOTOGRAPHERS[11].id, package_id: PHOTOGRAPHERS[11].packages[1].id, price: 110000, status: "shortlisted" as const, message: "Love F-7 garden Nikahs. Free on 19 Dec with two photographers." },
  { id: uid("0008", 7), gig_id: GIGS[2].id, photographer_id: PHOTOGRAPHERS[14].id, package_id: PHOTOGRAPHERS[14].packages[1].id, price: 125000, status: "submitted" as const, message: "Available for full afternoon and evening ceremony coverage." },
  // Gig 4 (awarded to Zainab Raza)
  { id: uid("0008", 8), gig_id: GIGS[3].id, photographer_id: PHOTOGRAPHERS[2].id, package_id: PHOTOGRAPHERS[2].packages[1].id, price: 195000, status: "awarded" as const, message: "Full editorial crew with lighting assistant and motion snippets." },
  { id: uid("0008", 9), gig_id: GIGS[3].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[2].id, price: 210000, status: "rejected" as const, message: "Natural light editorial coverage with medium-format look." },
  // Gig 5
  { id: uid("0008", 10), gig_id: GIGS[4].id, photographer_id: PHOTOGRAPHERS[3].id, package_id: PHOTOGRAPHERS[3].packages[1].id, price: 115000, status: "shortlisted" as const, message: "Two corporate photographers with fast 7-day turnaround." },
  { id: uid("0008", 11), gig_id: GIGS[4].id, photographer_id: PHOTOGRAPHERS[14].id, package_id: PHOTOGRAPHERS[14].packages[0].id, price: 110000, status: "submitted" as const, message: "Can travel to Karachi; includes same-evening press selects." },
  // Gig 6
  { id: uid("0008", 12), gig_id: GIGS[5].id, photographer_id: PHOTOGRAPHERS[6].id, package_id: PHOTOGRAPHERS[6].packages[0].id, price: 120000, status: "submitted" as const, message: "Experienced with low-light Qawali audio and multi-cam video." },
  { id: uid("0008", 13), gig_id: GIGS[5].id, photographer_id: PHOTOGRAPHERS[7].id, package_id: PHOTOGRAPHERS[7].packages[0].id, price: 90000, status: "submitted" as const, message: "Old Lahore haveli specialist; 6 hours coverage." },
  // Gig 7
  { id: uid("0008", 14), gig_id: GIGS[6].id, photographer_id: PHOTOGRAPHERS[13].id, package_id: PHOTOGRAPHERS[13].packages[0].id, price: 65000, status: "shortlisted" as const, message: "Editorial portrait session tailored for architecture studios." },
  { id: uid("0008", 15), gig_id: GIGS[6].id, photographer_id: PHOTOGRAPHERS[11].id, package_id: PHOTOGRAPHERS[11].packages[0].id, price: 48000, status: "submitted" as const, message: "Natural daylight portraits on location." },
  // Gig 8
  { id: uid("0008", 16), gig_id: GIGS[7].id, photographer_id: PHOTOGRAPHERS[6].id, package_id: PHOTOGRAPHERS[6].packages[1].id, price: 290000, status: "shortlisted" as const, message: "Three-person documentary film crew based in Lahore." },
  { id: uid("0008", 17), gig_id: GIGS[7].id, photographer_id: PHOTOGRAPHERS[12].id, package_id: PHOTOGRAPHERS[12].packages[1].id, price: 280000, status: "submitted" as const, message: "Available to travel from Islamabad with full 4K cinema rig." },
  // Gig 9
  { id: uid("0008", 18), gig_id: GIGS[8].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[0].id, price: 45000, status: "submitted" as const, message: "2-hour DHA home garden session, 45 edited photos in 10 days." },
  { id: uid("0008", 19), gig_id: GIGS[8].id, photographer_id: PHOTOGRAPHERS[3].id, package_id: PHOTOGRAPHERS[3].packages[0].id, price: 42000, status: "submitted" as const, message: "Portable soft lighting for evening garden family portraits." },
  // Gig 10
  { id: uid("0008", 20), gig_id: GIGS[9].id, photographer_id: PHOTOGRAPHERS[8].id, package_id: PHOTOGRAPHERS[8].packages[0].id, price: 55000, status: "rejected" as const, message: "Half-day lookbook and gallery coverage." },
];

// Bookings across all statuses + reviews on completed ones so every verified photographer has real ratings
const BOOKINGS = [
  // Active / non-completed statuses
  { id: uid("0009", 1), client_id: CLIENTS[0].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[1].id, event_type: "Weddings", event_date: "2026-12-21", start_time: "18:00:00", location: "Clifton Block 4, Karachi", duration_hours: 6, guests: 220, budget: 120000, requirements: "Quiet documentary approach around the family stage.", status: "requested" as const, source_gig_id: null },
  { id: uid("0009", 2), client_id: CLIENTS[1].id, photographer_id: PHOTOGRAPHERS[5].id, package_id: PHOTOGRAPHERS[5].packages[0].id, event_type: "Weddings", event_date: "2026-12-19", start_time: "15:00:00", location: "Model Town, Lahore", duration_hours: 4, guests: 140, budget: 70000, requirements: "Daylight courtyard Nikah portraits before sunset.", status: "accepted" as const, source_gig_id: null },
  { id: uid("0009", 3), client_id: AGENCY.id, photographer_id: PHOTOGRAPHERS[2].id, package_id: PHOTOGRAPHERS[2].packages[1].id, event_type: "Editorial", event_date: "2026-12-15", start_time: "09:00:00", location: "PECHS Heritage House, Karachi", duration_hours: 10, guests: 30, budget: 195000, requirements: "14 bridal looks, stills plus vertical reels.", status: "deposit_paid" as const, source_gig_id: GIGS[3].id },
  { id: uid("0009", 4), client_id: CLIENTS[2].id, photographer_id: PHOTOGRAPHERS[11].id, package_id: PHOTOGRAPHERS[11].packages[1].id, event_type: "Weddings", event_date: "2026-11-18", start_time: "13:00:00", location: "F-6/3 Garden, Islamabad", duration_hours: 6, guests: 160, budget: 110000, requirements: "Outdoor afternoon reception.", status: "shoot_done" as const, source_gig_id: null },
  { id: uid("0009", 5), client_id: CLIENTS[3].id, photographer_id: PHOTOGRAPHERS[1].id, package_id: PHOTOGRAPHERS[1].packages[1].id, event_type: "Weddings", event_date: "2026-11-12", start_time: "19:00:00", location: "DHA Phase 8 Creek Club, Karachi", duration_hours: 10, guests: 350, budget: 180000, requirements: "Full family group list provided.", status: "delivered" as const, source_gig_id: null },
  { id: uid("0009", 6), client_id: CLIENTS[3].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[0].id, event_type: "Corporate", event_date: "2026-12-05", start_time: "17:00:00", location: "I.I. Chundrigar Road, Karachi", duration_hours: 2, guests: 40, budget: 45000, requirements: "Evening partner portraits.", status: "rejected" as const, source_gig_id: null },
  { id: uid("0009", 7), client_id: CLIENTS[4].id, photographer_id: PHOTOGRAPHERS[6].id, package_id: PHOTOGRAPHERS[6].packages[0].id, event_type: "Weddings", event_date: "2026-12-08", start_time: "19:00:00", location: "Cantt, Lahore", duration_hours: 8, guests: 280, budget: 160000, requirements: "Dates changed by venue.", status: "cancelled" as const, source_gig_id: null },

  // Completed bookings with reviews (one per verified photographer so ratings are populated)
  { id: uid("0009", 101), client_id: CLIENTS[0].id, photographer_id: PHOTOGRAPHERS[0].id, package_id: PHOTOGRAPHERS[0].packages[0].id, event_type: "Portraits", event_date: "2026-10-12", start_time: "16:00:00", location: "Clifton, Karachi", duration_hours: 2, guests: 6, budget: 45000, requirements: "Golden hour family portraits.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 1), rating: 5, comment: "Sara was quiet, unhurried, and captured moments our family will treasure for decades." } },
  { id: uid("0009", 102), client_id: CLIENTS[3].id, photographer_id: PHOTOGRAPHERS[1].id, package_id: PHOTOGRAPHERS[1].packages[0].id, event_type: "Traditional events", event_date: "2026-10-14", start_time: "19:00:00", location: "PECHS, Karachi", duration_hours: 5, guests: 200, budget: 85000, requirements: "Baraat family portraits.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 2), rating: 5, comment: "Omar organized every family group with patience and delivered ahead of schedule." } },
  { id: uid("0009", 103), client_id: CLIENTS[0].id, photographer_id: PHOTOGRAPHERS[2].id, package_id: PHOTOGRAPHERS[2].packages[0].id, event_type: "Weddings", event_date: "2026-10-16", start_time: "15:00:00", location: "DHA Phase 6, Karachi", duration_hours: 4, guests: 90, budget: 95000, requirements: "Intimate home Nikah.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 3), rating: 5, comment: "Zainab has an editorial eye for light and small candid exchanges." } },
  { id: uid("0009", 104), client_id: AGENCY.id, photographer_id: PHOTOGRAPHERS[3].id, package_id: PHOTOGRAPHERS[3].packages[1].id, event_type: "Corporate", event_date: "2026-10-18", start_time: "09:00:00", location: "Clifton Corporate Tower, Karachi", duration_hours: 8, guests: 150, budget: 115000, requirements: "Annual summit.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 4), rating: 4, comment: "Clean executive portraits and punctual delivery for our press kit." } },
  { id: uid("0009", 105), client_id: CLIENTS[3].id, photographer_id: PHOTOGRAPHERS[4].id, package_id: PHOTOGRAPHERS[4].packages[0].id, event_type: "Weddings", event_date: "2026-10-20", start_time: "19:30:00", location: "Karsaz Gardens, Karachi", duration_hours: 6, guests: 250, budget: 165000, requirements: "Mehndi film.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 5), rating: 5, comment: "Nadia edited our Mehndi film with real warmth and crisp live sound." } },
  { id: uid("0009", 106), client_id: CLIENTS[4].id, photographer_id: PHOTOGRAPHERS[5].id, package_id: PHOTOGRAPHERS[5].packages[0].id, event_type: "Weddings", event_date: "2026-10-22", start_time: "14:00:00", location: "Gulberg III, Lahore", duration_hours: 4, guests: 110, budget: 70000, requirements: "Courtyard Nikah.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 6), rating: 5, comment: "Hira brings a calm presence and honest colour to every frame." } },
  { id: uid("0009", 107), client_id: CLIENTS[1].id, photographer_id: PHOTOGRAPHERS[6].id, package_id: PHOTOGRAPHERS[6].packages[0].id, event_type: "Weddings", event_date: "2026-10-24", start_time: "20:00:00", location: "Bedian Road Farmhouse, Lahore", duration_hours: 8, guests: 300, budget: 160000, requirements: "Baraat documentary film.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 7), rating: 5, comment: "Bilal captured the energy of the shehnai and dances without intrusive lighting." } },
  { id: uid("0009", 108), client_id: CLIENTS[4].id, photographer_id: PHOTOGRAPHERS[7].id, package_id: PHOTOGRAPHERS[7].packages[0].id, event_type: "Traditional events", event_date: "2026-10-26", start_time: "19:00:00", location: "DHA Phase 5, Lahore", duration_hours: 6, guests: 260, budget: 90000, requirements: "Barat stage & arrivals.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 8), rating: 4, comment: "Dependable team that knew how to manage a large Lahore gathering." } },
  { id: uid("0009", 109), client_id: CLIENTS[1].id, photographer_id: PHOTOGRAPHERS[8].id, package_id: PHOTOGRAPHERS[8].packages[0].id, event_type: "Editorial", event_date: "2026-10-28", start_time: "10:00:00", location: "MM Alam Studio, Lahore", duration_hours: 4, guests: 12, budget: 55000, requirements: "Winter shawl lookbook.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 9), rating: 5, comment: "Mehwish understood our textile textures immediately." } },
  { id: uid("0009", 110), client_id: CLIENTS[2].id, photographer_id: PHOTOGRAPHERS[11].id, package_id: PHOTOGRAPHERS[11].packages[0].id, event_type: "Portraits", event_date: "2026-10-30", start_time: "16:00:00", location: "Trail 5 Overlook, Islamabad", duration_hours: 3, guests: 4, budget: 48000, requirements: "Outdoor couple portraits.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 10), rating: 5, comment: "Ayesha picked the best late-afternoon light in the hills." } },
  { id: uid("0009", 111), client_id: CLIENTS[2].id, photographer_id: PHOTOGRAPHERS[12].id, package_id: PHOTOGRAPHERS[12].packages[0].id, event_type: "Weddings", event_date: "2026-11-02", start_time: "18:30:00", location: "Serena Courtyard, Islamabad", duration_hours: 7, guests: 240, budget: 155000, requirements: "Walima reception film.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 11), rating: 5, comment: "Usman delivered a beautifully paced Walima film and stills set." } },
  { id: uid("0009", 112), client_id: AGENCY.id, photographer_id: PHOTOGRAPHERS[13].id, package_id: PHOTOGRAPHERS[13].packages[0].id, event_type: "Editorial", event_date: "2026-11-04", start_time: "11:00:00", location: "E-7 Studio, Islamabad", duration_hours: 3, guests: 8, budget: 65000, requirements: "Ceramics artisan profile.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 12), rating: 5, comment: "Rabia composed every frame with quiet precision." } },
  { id: uid("0009", 113), client_id: CLIENTS[3].id, photographer_id: PHOTOGRAPHERS[14].id, package_id: PHOTOGRAPHERS[14].packages[0].id, event_type: "Corporate", event_date: "2026-11-06", start_time: "18:00:00", location: "Diplomatic Enclave, Islamabad", duration_hours: 5, guests: 120, budget: 80000, requirements: "Evening forum reception.", status: "completed" as const, source_gig_id: null, review: { id: uid("0010", 13), rating: 4, comment: "Haris delivered press selects the same night as promised." } },
];

/**
 * Generates a valid, dependency-free PNG buffer with a clean brand-palette
 * gradient so placeholder portfolio images and fake CNIC specimens render
 * cleanly without any external stock photos.
 */
function createSyntheticPng(
  width: number,
  height: number,
  topRgb: [number, number, number],
  bottomRgb: [number, number, number],
  borderRgb: [number, number, number]
): Buffer {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const t = height > 1 ? y / (height - 1) : 0;
    const r = Math.round(topRgb[0] * (1 - t) + bottomRgb[0] * t);
    const g = Math.round(topRgb[1] * (1 - t) + bottomRgb[1] * t);
    const b = Math.round(topRgb[2] * (1 - t) + bottomRgb[2] * t);
    const rowStart = y * rowSize;
    raw[rowStart] = 0; // filter type 0

    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const isBorder =
        x === 12 || x === width - 13 || y === 12 || y === height - 13;
      if (isBorder && x >= 12 && x <= width - 13 && y >= 12 && y <= height - 13) {
        raw[px] = borderRgb[0];
        raw[px + 1] = borderRgb[1];
        raw[px + 2] = borderRgb[2];
        raw[px + 3] = 255;
      } else {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
        raw[px + 3] = 255;
      }
    }
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }

  const crc32 = (buf: Buffer) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function sqlLit(v: string | null | undefined): string {
  if (v === null || v === undefined) return "null";
  return `'${v.replace(/'/g, "''")}'`;
}

function sqlArr(items: string[]): string {
  if (items.length === 0) return "'{}'::text[]";
  return `array[${items.map((s) => sqlLit(s)).join(", ")}]::text[]`;
}

function generateSeedSql(): string {
  const lines: string[] = [
    "-- supabase/seed.sql",
    "-- Momnt demo seed data (FYP-I): 15 photographers (Karachi, Lahore, Islamabad),",
    "-- 5 clients, 1 agency, 1 admin, packages, availability, portfolio images,",
    "-- fake CNIC verification requests, 10 gigs with bids, bookings and reviews.",
    "-- All names, phones, CNIC paths and images are synthetic demo data.",
    "",
    "begin;",
    "",
    "-- 1. Auth users (password: MomntDemoPassword123!)",
  ];

  const allUsers = [
    { ...ADMIN, business_name: null as string | null },
    ...CLIENTS.map((c) => ({ ...c, role: "client" as const, business_name: null as string | null })),
    { ...AGENCY },
    ...PHOTOGRAPHERS.map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      city: p.city,
      phone: p.phone,
      role: "photographer" as const,
      business_name: null as string | null,
    })),
  ];

  for (const u of allUsers) {
    const meta = JSON.stringify({
      role: u.role === "admin" ? "client" : u.role,
      full_name: u.full_name,
    });
    lines.push(
      `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)`,
      `values (${sqlLit(u.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${sqlLit(u.email)}, crypt(${sqlLit(DEMO_PASSWORD)}, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, ${sqlLit(meta)}::jsonb, now(), now())`,
      `on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;`
    );
  }

  lines.push("", "-- 2. Profiles");
  for (const u of allUsers) {
    lines.push(
      `insert into public.profiles (id, role, full_name, phone, city, business_name)`,
      `values (${sqlLit(u.id)}, ${sqlLit(u.role)}::public.user_role, ${sqlLit(u.full_name)}, ${sqlLit(u.phone)}, ${sqlLit(u.city)}, ${sqlLit(u.business_name)})`,
      `on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;`
    );
  }

  lines.push("", "-- 3. Photographer profiles, packages, availability, portfolio_images, verification_requests");
  for (const p of PHOTOGRAPHERS) {
    const social = JSON.stringify({
      instagram: `https://instagram.com/momnt.demo.${p.index}`,
      website: `https://momnt.example/demo/${p.index}`,
    });
    lines.push(
      `insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)`,
      `values (${sqlLit(p.id)}, ${sqlLit(p.bio)}, ${sqlArr(p.specializations)}, ${sqlArr(p.styles)}, ${sqlLit(social)}::jsonb, ${p.years_experience}, ${p.is_videographer}, ${sqlLit(p.verification_status)}::public.verification_status, ${sqlLit(p.created_at)}::timestamptz)`,
      `on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;`
    );

    for (const pkg of p.packages) {
      lines.push(
        `insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)`,
        `values (${sqlLit(pkg.id)}, ${sqlLit(p.id)}, ${sqlLit(pkg.name)}, ${pkg.price}, ${pkg.hours}, ${pkg.num_photographers}, ${pkg.edited_photos}, ${pkg.delivery_days}, ${sqlLit(JSON.stringify(pkg.addons))}::jsonb)`,
        `on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;`
      );
    }

    for (const day of p.booked_days_dec) {
      const dateStr = `2026-12-${String(day).padStart(2, "0")}`;
      lines.push(
        `insert into public.availability (photographer_id, date, status) values (${sqlLit(p.id)}, ${sqlLit(dateStr)}::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;`
      );
    }
    for (const day of p.unavailable_days_dec) {
      const dateStr = `2026-12-${String(day).padStart(2, "0")}`;
      lines.push(
        `insert into public.availability (photographer_id, date, status) values (${sqlLit(p.id)}, ${sqlLit(dateStr)}::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;`
      );
    }

    p.captions.forEach((caption, idx) => {
      const imgId = uid("0006", p.index * 10 + idx + 1);
      const storagePath = `${p.id}/demo-frame-0${idx + 1}.png`;
      lines.push(
        `insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)`,
        `values (${sqlLit(imgId)}, ${sqlLit(p.id)}, ${sqlLit(storagePath)}, ${sqlLit(caption)}, ${idx})`,
        `on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;`
      );
    });

    const vrId = uid("0011", p.index);
    const isReviewed = p.verification_status === "verified";
    lines.push(
      `insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)`,
      `values (${sqlLit(vrId)}, ${sqlLit(p.id)}, 'photographer', ${sqlLit(`${p.id}/cnic-front-demo.png`)}, ${sqlLit(`${p.id}/cnic-back-demo.png`)}, ${sqlLit(p.verification_status)}::public.verification_status, ${sqlLit(isReviewed ? "Demo CNIC specimen verified." : null)}, ${sqlLit(isReviewed ? ADMIN.id : null)}, ${isReviewed ? "now()" : "null"})`,
      `on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;`
    );
  }

  lines.push("", "-- 4. Gigs (10) and Bids (20)");
  for (const g of GIGS) {
    lines.push(
      `insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)`,
      `values (${sqlLit(g.id)}, ${sqlLit(g.client_id)}, ${sqlLit(g.title)}, ${sqlLit(g.event_type)}, ${sqlLit(g.event_date)}::date, ${sqlLit(g.city)}, ${g.hours}, ${g.budget_min}, ${g.budget_max}, ${sqlLit(g.description)}, ${sqlLit(g.bid_deadline)}::timestamptz, ${sqlLit(g.status)}::public.gig_status)`,
      `on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;`
    );
  }

  for (const b of BIDS) {
    lines.push(
      `insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)`,
      `values (${sqlLit(b.id)}, ${sqlLit(b.gig_id)}, ${sqlLit(b.photographer_id)}, ${sqlLit(b.package_id)}, ${b.price}, ${sqlLit(b.message)}, ${sqlLit(b.status)}::public.bid_status)`,
      `on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;`
    );
  }

  lines.push("", "-- 5. Bookings and Reviews");
  for (const bk of BOOKINGS) {
    lines.push(
      `insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)`,
      `values (${sqlLit(bk.id)}, ${sqlLit(bk.client_id)}, ${sqlLit(bk.photographer_id)}, ${sqlLit(bk.package_id)}, ${sqlLit(bk.event_type)}, ${sqlLit(bk.event_date)}::date, ${sqlLit(bk.start_time)}::time, ${sqlLit(bk.location)}, ${bk.duration_hours}, ${bk.guests}, ${bk.budget}, ${sqlLit(bk.requirements)}, ${sqlLit(bk.status)}::public.booking_status, ${sqlLit(bk.source_gig_id)})`,
      `on conflict (id) do nothing;`
    );
    if ("review" in bk && bk.review) {
      lines.push(
        `insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)`,
        `values (${sqlLit(bk.review.id)}, ${sqlLit(bk.id)}, ${sqlLit(bk.client_id)}, ${sqlLit(bk.photographer_id)}, ${bk.review.rating}, ${sqlLit(bk.review.comment)})`,
        `on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;`
      );
    }
  }

  lines.push("", "commit;", "");
  return lines.join("\n");
}

async function main() {
  // 1. Write supabase/seed.sql
  const seedSqlPath = path.join(process.cwd(), "supabase", "seed.sql");
  fs.writeFileSync(seedSqlPath, generateSeedSql(), "utf8");
  console.log(`Wrote ${seedSqlPath}`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.log("Skipping remote seed: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.");
    return;
  }

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Ensure all auth users exist
  const allUsers = [
    { ...ADMIN, business_name: null as string | null },
    ...CLIENTS.map((c) => ({ ...c, role: "client" as const, business_name: null as string | null })),
    { ...AGENCY },
    ...PHOTOGRAPHERS.map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      city: p.city,
      phone: p.phone,
      role: "photographer" as const,
      business_name: null as string | null,
    })),
  ];

  const { data: existingList } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existingById = new Set((existingList?.users ?? []).map((u) => u.id));
  const existingByEmail = new Map((existingList?.users ?? []).map((u) => [u.email, u.id]));

  for (const u of allUsers) {
    const staleId = existingByEmail.get(u.email);
    if (staleId && staleId !== u.id) {
      await supabase.auth.admin.deleteUser(staleId);
      existingById.delete(staleId);
    }
    if (!existingById.has(u.id)) {
      const { error } = await supabase.auth.admin.createUser({
        id: u.id,
        email: u.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          role: u.role === "admin" ? "client" : u.role,
          full_name: u.full_name,
        },
      });
      if (error) {
        console.warn(`createUser(${u.email}): ${error.message}`);
      }
    }
  }

  // 3. Upsert profiles
  const { error: profErr } = await supabase.from("profiles").upsert(
    allUsers.map((u) => ({
      id: u.id,
      role: u.role,
      full_name: u.full_name,
      phone: u.phone,
      city: u.city,
      business_name: u.business_name,
    })),
    { onConflict: "id" }
  );
  if (profErr) throw new Error(`profiles upsert failed: ${profErr.message}`);

  // 4. Upsert photographer_profiles
  const { error: phErr } = await supabase.from("photographer_profiles").upsert(
    PHOTOGRAPHERS.map((p) => ({
      profile_id: p.id,
      bio: p.bio,
      specializations: p.specializations,
      styles: p.styles,
      social_links: {
        instagram: `https://instagram.com/momnt.demo.${p.index}`,
        website: `https://momnt.example/demo/${p.index}`,
      },
      years_experience: p.years_experience,
      is_videographer: p.is_videographer,
      verification_status: p.verification_status,
      created_at: p.created_at,
    })),
    { onConflict: "profile_id" }
  );
  if (phErr) throw new Error(`photographer_profiles upsert failed: ${phErr.message}`);

  // 5. Upsert packages
  const allPackages = PHOTOGRAPHERS.flatMap((p) =>
    p.packages.map((pkg) => ({
      id: pkg.id,
      photographer_id: p.id,
      name: pkg.name,
      price: pkg.price,
      hours: pkg.hours,
      num_photographers: pkg.num_photographers,
      edited_photos: pkg.edited_photos,
      delivery_days: pkg.delivery_days,
      addons: pkg.addons,
    }))
  );
  const { error: pkgErr } = await supabase.from("packages").upsert(allPackages, {
    onConflict: "id",
  });
  if (pkgErr) throw new Error(`packages upsert failed: ${pkgErr.message}`);

  // 6. Upsert availability
  const allAvailability = PHOTOGRAPHERS.flatMap((p) => [
    ...p.booked_days_dec.map((day) => ({
      photographer_id: p.id,
      date: `2026-12-${String(day).padStart(2, "0")}`,
      status: "booked" as const,
    })),
    ...p.unavailable_days_dec.map((day) => ({
      photographer_id: p.id,
      date: `2026-12-${String(day).padStart(2, "0")}`,
      status: "unavailable" as const,
    })),
  ]);
  const { error: availErr } = await supabase
    .from("availability")
    .upsert(allAvailability, { onConflict: "photographer_id,date" });
  if (availErr) throw new Error(`availability upsert failed: ${availErr.message}`);

  // 7. Upload synthetic fake CNIC PNGs & placeholder portfolio PNGs, then upsert rows
  const cnicPng = createSyntheticPng(320, 200, [241, 240, 236], [227, 229, 232], [194, 162, 103]);
  const tones: Array<[[number, number, number], [number, number, number]]> = [
    [[241, 240, 236], [194, 162, 103]], // warm
    [[10, 20, 40], [38, 50, 74]],       // midnight
    [[91, 101, 120], [10, 20, 40]],     // slate
    [[194, 162, 103], [241, 240, 236]], // dune
  ];
  const tonePngs = tones.map(([top, bottom]) =>
    createSyntheticPng(360, 270, top, bottom, [194, 162, 103])
  );

  const portfolioRows: Array<{
    id: string;
    photographer_id: string;
    storage_path: string;
    caption: string;
    sort_order: number;
  }> = [];

  for (const p of PHOTOGRAPHERS) {
    // Upload fake CNIC front and back
    const frontPath = `${p.id}/cnic-front-demo.png`;
    const backPath = `${p.id}/cnic-back-demo.png`;
    await Promise.all([
      supabase.storage
        .from("verification-docs")
        .upload(frontPath, cnicPng, { contentType: "image/png", upsert: true }),
      supabase.storage
        .from("verification-docs")
        .upload(backPath, cnicPng, { contentType: "image/png", upsert: true }),
    ]);

    await Promise.all(
      p.captions.map(async (caption, idx) => {
        const imgId = uid("0006", p.index * 10 + idx + 1);
        const storagePath = `${p.id}/demo-frame-0${idx + 1}.png`;
        await supabase.storage
          .from("portfolio")
          .upload(storagePath, tonePngs[(p.index + idx) % tonePngs.length], {
            contentType: "image/png",
            upsert: true,
          });
        portfolioRows.push({
          id: imgId,
          photographer_id: p.id,
          storage_path: storagePath,
          caption,
          sort_order: idx,
        });
      })
    );
  }

  const { error: portErr } = await supabase
    .from("portfolio_images")
    .upsert(portfolioRows, { onConflict: "id" });
  if (portErr) throw new Error(`portfolio_images upsert failed: ${portErr.message}`);

  // 8. Verification requests
  const vrRows = PHOTOGRAPHERS.map((p) => {
    const isReviewed = p.verification_status === "verified";
    return {
      id: uid("0011", p.index),
      user_id: p.id,
      role_requested: "photographer" as const,
      cnic_front_path: `${p.id}/cnic-front-demo.png`,
      cnic_back_path: `${p.id}/cnic-back-demo.png`,
      status: p.verification_status,
      admin_note: isReviewed ? "Demo CNIC specimen verified." : null,
      reviewed_by: isReviewed ? ADMIN.id : null,
      reviewed_at: isReviewed ? new Date().toISOString() : null,
    };
  });
  const { error: vrErr } = await supabase
    .from("verification_requests")
    .upsert(vrRows, { onConflict: "id" });
  if (vrErr) throw new Error(`verification_requests upsert failed: ${vrErr.message}`);

  // 9. Gigs and bids
  const { error: gigErr } = await supabase.from("gigs").upsert(GIGS, {
    onConflict: "id",
  });
  if (gigErr) throw new Error(`gigs upsert failed: ${gigErr.message}`);

  const { error: bidErr } = await supabase.from("bids").upsert(BIDS, {
    onConflict: "id",
  });
  if (bidErr) throw new Error(`bids upsert failed: ${bidErr.message}`);

  // 10. Bookings and reviews
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("id")
    .in(
      "id",
      BOOKINGS.map((b) => b.id)
    );
  const existingBookingIds = new Set((existingBookings ?? []).map((b) => b.id));
  const bookingsToInsert = BOOKINGS.filter((b) => !existingBookingIds.has(b.id)).map(
    ({ id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id }) => ({
      id,
      client_id,
      photographer_id,
      package_id,
      event_type,
      event_date,
      start_time,
      location,
      duration_hours,
      guests,
      budget,
      requirements,
      status,
      source_gig_id,
    })
  );

  if (bookingsToInsert.length > 0) {
    const { error: bkErr } = await supabase.from("bookings").insert(bookingsToInsert);
    if (bkErr) throw new Error(`bookings insert failed: ${bkErr.message}`);
  }

  const reviewRows = BOOKINGS.filter(
    (b): b is typeof b & { review: { id: string; rating: number; comment: string } } =>
      "review" in b && Boolean(b.review)
  ).map((b) => ({
    id: b.review.id,
    booking_id: b.id,
    reviewer_id: b.client_id,
    photographer_id: b.photographer_id,
    rating: b.review.rating,
    comment: b.review.comment,
  }));

  const { error: revErr } = await supabase
    .from("reviews")
    .upsert(reviewRows, { onConflict: "booking_id" });
  if (revErr) throw new Error(`reviews upsert failed: ${revErr.message}`);

  console.log(
    `Seeded remote database: ${PHOTOGRAPHERS.length} photographers, ${CLIENTS.length} clients, 1 agency, 1 admin, ${GIGS.length} gigs, ${BIDS.length} bids, ${BOOKINGS.length} bookings, ${reviewRows.length} reviews.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

