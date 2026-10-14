import type { Vendor, Quote } from "@/lib/types";
import { SAMPLE_PRICES } from "./prices";

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "vd-print-house",
    name: "Print House",
    category: "Album printing & framing",
    city: "Karachi",
    verified: true,
    status: "verified",
    description: "Fine art photo printing, archival flush-mount albums, and custom framing for wedding photographers.",
  },
  {
    id: "vd-lahore-craft",
    name: "Lahore Fine Prints",
    category: "Linen & leather binding",
    city: "Lahore",
    verified: true,
    status: "verified",
    description: "Handcrafted heirloom albums bound in local leather and imported linen.",
  },
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: "qt-print-house-001",
    vendorId: "vd-print-house",
    vendorName: "Print House",
    status: "quoted",
    lineItems: [
      {
        id: "li-01",
        label: "30 page album (flush mount, matte paper)",
        price: SAMPLE_PRICES.vendors.printHouse.albumThirtyPages, // sample price: 28,000 PKR
      },
      {
        id: "li-02",
        label: "Linen cover (oatmeal natural linen)",
        price: SAMPLE_PRICES.vendors.printHouse.linenCoverUpgrade, // sample price: 6,500 PKR
      },
      {
        id: "li-03",
        label: "Delivery (insured courier in Karachi)",
        price: SAMPLE_PRICES.vendors.printHouse.courierDelivery, // sample price: 1,500 PKR
      },
    ],
    total: SAMPLE_PRICES.vendors.printHouse.totalQuote, // sample price: 36,000 PKR
    validUntil: "30 November 2026",
    notes: "Turnaround 10 working days after layout approval. Includes digital proofing revision.",
  },
  {
    id: "qt-print-house-accepted",
    vendorId: "vd-print-house",
    vendorName: "Print House",
    status: "accepted",
    lineItems: [
      {
        id: "li-ac-01",
        label: "20 page parent album set",
        price: 32000, // sample price: 32,000 PKR
      },
      {
        id: "li-ac-02",
        label: "Delivery",
        price: 1500, // sample price: 1,500 PKR
      },
    ],
    total: 33500, // sample price: 33,500 PKR
    validUntil: "15 December 2026",
  },
];
