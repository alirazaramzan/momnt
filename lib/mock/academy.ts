import type { Course, Workshop } from "@/lib/types";
import { SAMPLE_PRICES } from "./prices";

export const MOCK_COURSES: Course[] = [
  {
    id: "crs-wedding-mastery",
    title: "Wedding photography, from first frame to delivery",
    description: "Taught by a verified senior photographer. 24 lessons, certificate on completion.",
    instructorName: "Sara Khan",
    instructorVerified: true,
    lessonsCount: 24,
    certificate: true,
    lessons: [
      {
        id: "lsn-01",
        number: 1,
        title: "Pacing and preparation for Pakistani weddings",
        duration: "14 min",
        completed: true,
      },
      {
        id: "lsn-02",
        number: 2,
        title: "Prime lenses and dual-body camera setups",
        duration: "21 min",
        completed: true,
      },
      {
        id: "lsn-03",
        number: 3,
        title: "Window light in afternoon portraits",
        duration: "18 min",
        completed: false,
      },
      {
        id: "lsn-04",
        number: 4,
        title: "Navigating crowded Mehndi dance floors",
        duration: "26 min",
        completed: false,
      },
      {
        id: "lsn-05",
        number: 5,
        title: "Culling and color-consistent Lightroom workflows",
        duration: "32 min",
        completed: false,
      },
    ],
  },
  {
    id: "crs-business-contracts",
    title: "Client communication and shoot contracts",
    description: "Legal protections, deposit structures, and managing client expectations.",
    instructorName: "Omar Siddiqui",
    instructorVerified: true,
    lessonsCount: 8,
    certificate: true,
    lessons: [
      {
        id: "lsn-bc-01",
        number: 1,
        title: "Writing clear terms for event delays",
        duration: "15 min",
        completed: true,
      },
      {
        id: "lsn-bc-02",
        number: 2,
        title: "Proofing turnaround agreements",
        duration: "19 min",
        completed: false,
      },
    ],
  },
];

export const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: "wks-lighting-mehndi",
    title: "Lighting a mehndi night",
    instructorName: "Sara Khan",
    date: "Saturday, 18 October 2026",
    time: "7:00 pm PKT",
    seatsTotal: 25,
    seatsLeft: 12,
    price: SAMPLE_PRICES.academy.lightingMehndiWorkshop, // sample price: 8,500 PKR
    isLive: true,
  },
  {
    id: "wks-candid-direction",
    title: "Directing unposed couple portraits",
    instructorName: "Hira Anwar",
    date: "Sunday, 25 October 2026",
    time: "5:00 pm PKT",
    seatsTotal: 20,
    seatsLeft: 6,
    price: 6000, // sample price: 6,000 PKR
    isLive: false,
  },
];
