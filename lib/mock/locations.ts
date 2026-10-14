import type { Location } from "@/lib/types";
import { SAMPLE_PRICES } from "./prices";

export const MOCK_LOCATIONS: Location[] = [
  {
    id: "loc-rooftop-studio-clifton",
    name: "The Rooftop Studio",
    area: "Clifton",
    city: "Karachi",
    verified: true,
    capacity: "Up to 15 people",
    fees: {
      slot: SAMPLE_PRICES.locations.theRooftopStudio.threeHourSlot, // sample price: 35,000 PKR for 3 hours
      hourly: SAMPLE_PRICES.locations.theRooftopStudio.hourlyExtension, // sample price: 12,000 PKR per hour
      deposit: SAMPLE_PRICES.locations.theRooftopStudio.securityDeposit, // sample price: 15,000 PKR refundable deposit
    },
    rules: [
      "3 hour slots",
      "Up to 6 crew members",
      "No drone flights",
      "Props allowed with prior approval",
      "No open flames or smoke flares",
    ],
    contactNote: "Contact venue manager via Momnt messages.",
  },
  {
    id: "loc-haveli-lahore",
    name: "Old City Courtyard",
    area: "Walled City",
    city: "Lahore",
    verified: true,
    capacity: "Up to 25 people",
    fees: {
      slot: 45000, // sample price: 45,000 PKR for 4-hour morning slot
      hourly: 15000, // sample price: 15,000 PKR per hour
      deposit: 20000, // sample price: 20,000 PKR security deposit
    },
    rules: [
      "Morning daylight slots only (8:00 am to 1:00 pm)",
      "Up to 8 crew members",
      "Handheld stabilizer or tripod only",
      "Historical structure care guidelines apply",
    ],
    contactNote: "Contact heritage curator via Momnt messages.",
  },
];
