// Momnt platform domain types
// Status names follow AGENTS.md and product specification exactly.

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "rejected";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "deposit"
  | "shoot_done"
  | "delivered"
  | "completed";

export type QuoteStatus =
  | "quoted"
  | "accepted"
  | "in_progress"
  | "delivered";

export type PlaceholderTone = "warm" | "midnight" | "slate" | "dune";

export interface PortfolioItem {
  id: string;
  tone: PlaceholderTone;
  caption: string;
  number?: string | number;
  aspect?: "4/3" | "1/1" | "16/9" | "3/2";
  credit?: string;
  event?: string;
  aperture?: string;
}

export interface Package {
  id?: string;
  name: string;
  hours: number;
  photographers: number;
  editedPhotos: number;
  deliveryTime: string;
  price: number; // PKR - sample price
}

export interface Photographer {
  id: string;
  name: string;
  city: string;
  specialisations: string[];
  styles: string[];
  verified: boolean;
  status: VerificationStatus;
  rating: number;
  replyTime: string;
  packages: Package[];
  portfolio: PortfolioItem[];
  nextFree: string; // date string e.g. "14 Dec" or "2026-12-14"
  avatarSrc?: string;
  bio?: string;
}

export interface Booking {
  id: string;
  event: string;
  date: string;
  time: string;
  venue: string;
  guests: number;
  package: Package;
  status: BookingStatus;
  depositPaid: boolean;
  photographerId: string;
  photographerName: string;
  photographerVerified?: boolean;
  clientName: string;
  notes?: string;
}

export interface Bid {
  id: string;
  photographer: string; // Photographer name or reference
  photographerId?: string;
  verified?: boolean;
  price: number; // PKR - sample price
  rating: number;
  replyTime: string;
  availability: string;
}

export interface Gig {
  id: string;
  title: string;
  eventType: string;
  city: string;
  date: string;
  hours: number;
  budgetFrom: number; // PKR - sample price
  budgetTo: number; // PKR - sample price
  bidDeadline: string;
  bids?: Bid[];
  clientName?: string;
  description?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "photographer" | "vendor" | "admin";
  text: string;
  sentAt: string;
  attachment?: {
    type: "placeholder";
    caption?: string;
    tone?: PlaceholderTone;
  };
}

export interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: "client" | "photographer" | "vendor" | "admin";
  replySpeed?: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
}

export interface QuoteLineItem {
  id: string;
  label: string;
  price: number; // PKR - sample price
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  city: string;
  verified: boolean;
  status: VerificationStatus;
  description?: string;
}

export interface Quote {
  id: string;
  vendorId: string;
  vendorName: string;
  lineItems: QuoteLineItem[];
  total: number; // PKR - sample price
  status: QuoteStatus;
  validUntil?: string;
  notes?: string;
}

export interface LocationFees {
  hourly?: number; // PKR - sample price
  slot?: number; // PKR - sample price
  deposit?: number; // PKR - sample price
}

export interface Location {
  id: string;
  name: string;
  area: string;
  city: string;
  fees: LocationFees;
  rules: string[];
  verified: boolean;
  capacity?: string;
  contactNote?: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  isLive?: boolean;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorVerified: boolean;
  lessonsCount: number;
  lessons: Lesson[];
  certificate: boolean;
}

export interface Workshop {
  id: string;
  title: string;
  instructorName: string;
  date: string;
  time: string;
  seatsTotal: number;
  seatsLeft: number;
  price: number; // PKR - sample price
  isLive: boolean;
}

export interface ShotListItem {
  id: string;
  group: "essential" | "details" | "candid" | "creative";
  label: string;
  done: boolean;
}
