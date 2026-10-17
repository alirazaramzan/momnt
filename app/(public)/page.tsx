"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CropMarks, PhotoPlaceholder } from "@/components/brand";
import { SectionHeader } from "@/components/patterns";

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState("Karachi");
  const [event, setEvent] = useState("Mehndi");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/client");
  };

  return (
    <div className="w-full py-12 md:py-16">
      <div className="max-w-[1120px] mx-auto px-6 space-y-16 md:space-y-24 text-left">
        {/* Hero Section: Above the fold */}
        <section aria-labelledby="hero-heading" className="space-y-8 md:space-y-10">
          {/* Headline and Slate Subtitle */}
          <div className="space-y-4">
            <h1
              id="hero-heading"
              className="font-display text-[36px] sm:text-[48px] lg:text-[64px] font-normal leading-[1.08] text-midnight max-w-[14ch] select-none"
            >
              Every moment, in trusted hands.
            </h1>
            <p className="font-sans text-[16px] leading-[26px] text-slate max-w-[48ch]">
              Find verified photographers, compare clear prices and book your date,
              or post a gig and let photographers bid.
            </p>
          </div>

          {/* Search Bar wrapped with CropMarks (only CropMarks instance on page) */}
          <div className="pt-2">
            <CropMarks className="w-full max-w-[760px] p-2.5 sm:p-3 block">
              <form
                onSubmit={handleSearch}
                role="search"
                aria-label="Search photographers"
                className="w-full bg-chalk border border-midnight rounded-[2px] grid grid-cols-1 md:grid-cols-[1.1fr_1.1fr_1.1fr_auto] divide-y md:divide-y-0 md:divide-x divide-[#CFCFCB] overflow-hidden"
              >
                {/* Field 1: City */}
                <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center focus-within:bg-[#E3E5E8]/30 transition-colors">
                  <label
                    htmlFor="search-city"
                    className="text-xs font-sans font-medium text-slate select-none block mb-0.5 leading-none"
                  >
                    City
                  </label>
                  <input
                    id="search-city"
                    name="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Karachi"
                    className="w-full bg-transparent font-sans text-sm font-semibold text-midnight placeholder:text-midnight/60 focus:outline-none"
                  />
                </div>

                {/* Field 2: Event */}
                <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center focus-within:bg-[#E3E5E8]/30 transition-colors">
                  <label
                    htmlFor="search-event"
                    className="text-xs font-sans font-medium text-slate select-none block mb-0.5 leading-none"
                  >
                    Event
                  </label>
                  <input
                    id="search-event"
                    name="event"
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    placeholder="Mehndi"
                    className="w-full bg-transparent font-sans text-sm font-semibold text-midnight placeholder:text-midnight/60 focus:outline-none"
                  />
                </div>

                {/* Field 3: Date */}
                <div className="p-3 sm:px-4 sm:py-3 flex flex-col justify-center focus-within:bg-[#E3E5E8]/30 transition-colors">
                  <label
                    htmlFor="search-date"
                    className="text-xs font-sans font-medium text-slate select-none block mb-0.5 leading-none"
                  >
                    Date
                  </label>
                  <input
                    id="search-date"
                    name="date"
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Add a date"
                    className="w-full bg-transparent font-sans text-sm font-semibold text-midnight placeholder:text-slate focus:outline-none"
                  />
                </div>

                {/* Submit Action: Solid midnight Search block */}
                <button
                  type="submit"
                  className="bg-midnight text-chalk font-sans font-medium text-sm px-8 py-3.5 md:py-0 flex items-center justify-center hover:opacity-90 active:opacity-100 transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
                >
                  Search
                </button>
              </form>
            </CropMarks>
          </div>

          {/* Row of Three PhotoPlaceholder Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full pt-4">
            <PhotoPlaceholder
              tone="warm"
              aspect="4/3"
              withCorners={false}
              caption={{ number: "014", event: "Mehndi", aperture: "f/1.8" }}
              className="w-full"
            />
            <PhotoPlaceholder
              tone="midnight"
              aspect="4/3"
              withCorners={false}
              caption={{ number: "021", event: "Baraat", aperture: "f/2.8" }}
              className="w-full"
            />
            <PhotoPlaceholder
              tone="slate"
              aspect="4/3"
              withCorners={false}
              caption={{ number: "007", event: "Portrait", aperture: "f/1.4" }}
              className="w-full"
            />
          </div>
        </section>

        {/* Four Ways to Use Momnt Section */}
        <section aria-labelledby="four-ways-heading" className="space-y-8 pt-8 border-t border-[#CFCFCB]">
          <SectionHeader
            id="four-ways-heading"
            title="Four ways to use Momnt"
            lede="One verified platform for clients, photographers, vendors, and students."
          />

          {/* Four plain text columns (strictly no icons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div className="space-y-3">
              <h3 className="font-sans text-[18px] sm:text-[20px] font-semibold leading-snug text-midnight">
                Book a photographer
              </h3>
              <p className="font-sans text-sm text-slate leading-[22px]">
                Browse verified portfolios, compare clear package prices, and book with date protection.
              </p>
              <div>
                <Link
                  href="/client"
                  className="inline-flex items-center font-sans text-sm font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
                >
                  Browse photographers
                </Link>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <h3 className="font-sans text-[18px] sm:text-[20px] font-semibold leading-snug text-midnight">
                Post a gig
              </h3>
              <p className="font-sans text-sm text-slate leading-[22px]">
                Share your event requirements and receive direct bids from available local talent.
              </p>
              <div>
                <Link
                  href="/client"
                  className="inline-flex items-center font-sans text-sm font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
                >
                  Post a brief
                </Link>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <h3 className="font-sans text-[18px] sm:text-[20px] font-semibold leading-snug text-midnight">
                Learn in the Academy
              </h3>
              <p className="font-sans text-sm text-slate leading-[22px]">
                Sharpen craft and business skills through structured lessons and live workshops.
              </p>
              <div>
                <Link
                  href="/client"
                  className="inline-flex items-center font-sans text-sm font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
                >
                  Explore courses
                </Link>
              </div>
            </div>

            {/* Column 4 */}
            <div className="space-y-3">
              <h3 className="font-sans text-[18px] sm:text-[20px] font-semibold leading-snug text-midnight">
                Find vendors and locations
              </h3>
              <p className="font-sans text-sm text-slate leading-[22px]">
                Discover verified studios, rooftop spaces, print labs, and event specialists.
              </p>
              <div>
                <Link
                  href="/vendor"
                  className="inline-flex items-center font-sans text-sm font-medium text-midnight hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
                >
                  View directory
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
