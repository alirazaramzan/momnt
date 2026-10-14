import type { Gig } from "@/lib/types";
import { SAMPLE_PRICES } from "./prices";

export const MOCK_GIGS: Gig[] = [
  {
    id: "gig-clifton-mehndi",
    title: "Mehndi photographer needed for Clifton family wedding",
    eventType: "Mehndi",
    city: "Karachi",
    date: "14 December 2026",
    hours: 6,
    budgetFrom: SAMPLE_PRICES.gigs.cliftonMehndi.budgetFrom, // sample price: 100,000 PKR
    budgetTo: SAMPLE_PRICES.gigs.cliftonMehndi.budgetTo, // sample price: 250,000 PKR
    bidDeadline: "10 November 2026",
    clientName: "Sara and Ahmed",
    description: "Looking for an experienced documentary photographer for a 250-guest evening event in Clifton. No overly posed shots.",
    bids: [
      {
        id: "bid-sara-khan",
        photographer: "Sara Khan",
        photographerId: "ph-sara-khan",
        verified: true,
        price: SAMPLE_PRICES.gigs.cliftonMehndi.bids.saraKhan, // sample price: 220,000 PKR
        rating: 4.9,
        replyTime: "1 hour",
        availability: "Free",
      },
      {
        id: "bid-omar-siddiqui",
        photographer: "Omar Siddiqui",
        photographerId: "ph-omar-siddiqui",
        verified: true,
        price: SAMPLE_PRICES.gigs.cliftonMehndi.bids.omarSiddiqui, // sample price: 175,000 PKR
        rating: 4.7,
        replyTime: "3 hours",
        availability: "Free",
      },
      {
        id: "bid-hira-anwar",
        photographer: "Hira Anwar",
        photographerId: "ph-hira-anwar",
        verified: true,
        price: SAMPLE_PRICES.gigs.cliftonMehndi.bids.hiraAnwar, // sample price: 190,000 PKR
        rating: 4.8,
        replyTime: "1 day",
        availability: "Free",
      },
    ],
  },
  {
    id: "gig-gulberg-portraits",
    title: "Couple portrait session in historic garden",
    eventType: "Portrait session",
    city: "Lahore",
    date: "18 December 2026",
    hours: 3,
    budgetFrom: SAMPLE_PRICES.gigs.portraitSessionGulberg.budgetFrom, // sample price: 35,000 PKR
    budgetTo: SAMPLE_PRICES.gigs.portraitSessionGulberg.budgetTo, // sample price: 60,000 PKR
    bidDeadline: "25 November 2026",
    clientName: "Kamran & Maria",
    description: "Outdoor natural light portraits before dusk. Looking for film or muted documentary tones.",
    bids: [
      {
        id: "bid-hira-anwar-portrait",
        photographer: "Hira Anwar",
        photographerId: "ph-hira-anwar",
        verified: true,
        price: SAMPLE_PRICES.gigs.portraitSessionGulberg.bids.hiraAnwar, // sample price: 45,000 PKR
        rating: 4.8,
        replyTime: "1 day",
        availability: "Free",
      },
    ],
  },
];
