"use client";

import React, { useState, useMemo } from "react";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { PhotographerCard, EmptyState } from "@/components/patterns";
import { PhotoPlaceholder } from "@/components/brand";
import {
  Button,
  Select,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";

export default function PhotographersPage() {
  // Filter state (Verified only on by default)
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [city, setCity] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");
  const [budget, setBudget] = useState<string>("all");
  const [role, setRole] = useState<string>("all");
  const [availableDate, setAvailableDate] = useState<string>("");

  // Sort state
  const [sortBy, setSortBy] = useState<string>("rating");

  // Compare state (up to three)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareNotice, setCompareNotice] = useState<string>("");

  // Mobile filters dialog
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Helper to reset filters
  const resetFilters = () => {
    setVerifiedOnly(true);
    setCity("all");
    setEventType("all");
    setStyle("all");
    setBudget("all");
    setRole("all");
    setAvailableDate("");
  };

  // Helper to calculate minimum package starting price
  const getStartingPrice = (packages: { price: number }[]) => {
    if (!packages.length) return 0;
    return Math.min(...packages.map((p) => p.price));
  };

  // Filtered & sorted photographers
  const filteredPhotographers = useMemo(() => {
    return MOCK_PHOTOGRAPHERS.filter((ph) => {
      // 1. Verified filter
      if (verifiedOnly && !ph.verified) return false;

      // 2. City filter
      if (city !== "all" && ph.city.toLowerCase() !== city.toLowerCase()) return false;

      // 3. Event type filter
      if (
        eventType !== "all" &&
        !ph.specialisations.some((s) => s.toLowerCase() === eventType.toLowerCase())
      ) {
        return false;
      }

      // 4. Style filter
      if (
        style !== "all" &&
        !ph.styles.some((s) => s.toLowerCase() === style.toLowerCase())
      ) {
        return false;
      }

      // 5. Budget filter
      const startingPrice = getStartingPrice(ph.packages);
      if (budget === "under_75k" && startingPrice >= 75000) return false;
      if (budget === "75k_150k" && (startingPrice < 75000 || startingPrice > 150000)) {
        return false;
      }
      if (budget === "above_150k" && startingPrice <= 150000) return false;

      // 6. Role filter (photographer, videographer, both)
      if (role === "photographer") {
        if (ph.role && ph.role !== "photographer" && ph.role !== "both") return false;
      } else if (role === "videographer") {
        if (ph.role && ph.role !== "videographer" && ph.role !== "both") return false;
      }

      // 7. Available date filter (partial match)
      if (
        availableDate.trim() &&
        !ph.nextFree.toLowerCase().includes(availableDate.trim().toLowerCase())
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") {
        return getStartingPrice(a.packages) - getStartingPrice(b.packages);
      }
      if (sortBy === "price_desc") {
        return getStartingPrice(b.packages) - getStartingPrice(a.packages);
      }
      if (sortBy === "newest") {
        return b.id.localeCompare(a.id);
      }
      // default: highest rating
      return b.rating - a.rating;
    });
  }, [verifiedOnly, city, eventType, style, budget, role, availableDate, sortBy]);

  // Handle compare toggle with maximum limit of 3 enforced
  const handleToggleCompare = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedForCompare.length >= 3) {
        setCompareNotice("You can compare up to three photographers. Uncheck one to add another.");
        return;
      }
      setCompareNotice("");
      setSelectedForCompare((prev) => [...prev, id]);
    } else {
      setCompareNotice("");
      setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    }
  };

  // Reusable filter controls block
  const filterControls = (
    <div className="space-y-5 text-left">
      {/* 1. Verified Only Checkbox (on by default) */}
      <div className="pt-1 pb-3 border-b border-[#CFCFCB]">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id="filter-verified"
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="size-4 rounded-[2px] border border-[#CFCFCB] accent-midnight cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
          />
          <span className="font-sans text-sm font-medium text-midnight">
            Verified only
          </span>
        </label>
      </div>

      {/* 2. City */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-city">City</Label>
        <Select
          id="filter-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="all">All cities</option>
          <option value="Karachi">Karachi</option>
          <option value="Lahore">Lahore</option>
          <option value="Islamabad">Islamabad</option>
        </Select>
      </div>

      {/* 3. Event Type */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-event">Event type</Label>
        <Select
          id="filter-event"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="all">All events</option>
          <option value="Weddings">Weddings</option>
          <option value="Portraits">Portraits</option>
          <option value="Editorial">Editorial</option>
          <option value="Corporate">Corporate</option>
          <option value="Traditional events">Traditional events</option>
        </Select>
      </div>

      {/* 4. Style */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-style">Style</Label>
        <Select
          id="filter-style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="all">All styles</option>
          <option value="Documentary">Documentary</option>
          <option value="Natural light">Natural light</option>
          <option value="Classic">Classic</option>
          <option value="Fine art">Fine art</option>
          <option value="Editorial">Editorial</option>
          <option value="Cinematic">Cinematic</option>
        </Select>
      </div>

      {/* 5. Budget Range */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-budget">Budget range</Label>
        <Select
          id="filter-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="all">Any budget</option>
          <option value="under_75k">Under PKR 75,000</option>
          <option value="75k_150k">PKR 75,000 – 150,000</option>
          <option value="above_150k">Above PKR 150,000</option>
        </Select>
      </div>

      {/* 6. Photographer or Videographer */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-role">Professional</Label>
        <Select
          id="filter-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="all">Photographer or videographer</option>
          <option value="photographer">Photographer</option>
          <option value="videographer">Videographer</option>
        </Select>
      </div>

      {/* 7. Available Date */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-date">Available date</Label>
        <Input
          id="filter-date"
          type="text"
          value={availableDate}
          onChange={(e) => setAvailableDate(e.target.value)}
          placeholder="e.g. 14 Dec"
        />
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <Button
          variant="quiet"
          size="sm"
          onClick={resetFilters}
          className="text-xs text-slate hover:text-midnight p-0 h-auto"
        >
          Reset filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full py-8 md:py-12 bg-chalk text-midnight min-h-screen">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column: 260px desktop filter sidebar */}
          <aside
            aria-label="Filter photographers"
            className="w-[260px] shrink-0 border-r border-[#CFCFCB] pr-8 hidden lg:block sticky top-24 self-start"
          >
            <div className="space-y-4">
              <h2 className="font-sans text-base font-semibold text-midnight">
                Filters
              </h2>
              {filterControls}
            </div>
          </aside>

          {/* Right Column: Results & List */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Header controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CFCFCB]">
              {/* Result count line in slate */}
              <div className="font-sans text-sm text-slate tabular-nums">
                Showing {filteredPhotographers.length}{" "}
                {filteredPhotographers.length === 1 ? "photographer" : "photographers"}
              </div>

              {/* Mobile Filters trigger & Sort Select */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden text-sm"
                >
                  Filters
                </Button>

                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-select" className="text-xs text-slate hidden sm:inline-block">
                    Sort by
                  </Label>
                  <Select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-[180px] text-xs h-9"
                  >
                    <option value="rating">Highest rating</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="newest">Newest</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Plain compare limit message banner */}
            {compareNotice && (
              <div
                role="status"
                aria-live="polite"
                className="border border-[#CFCFCB] bg-[#E3E5E8]/30 px-4 py-3 rounded-[2px] text-xs font-sans text-slate space-y-0.5"
              >
                <p className="font-semibold text-midnight">Compare limit</p>
                <p>{compareNotice}</p>
              </div>
            )}

            {/* Single column list of PhotographerCards */}
            {filteredPhotographers.length > 0 ? (
              <div className="space-y-4">
                {filteredPhotographers.map((ph) => {
                  const isChecked = selectedForCompare.includes(ph.id);
                  const isCompareDisabled =
                    selectedForCompare.length >= 3 && !isChecked;

                  // 3-photo strip on the right
                  const photoStrip = (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {ph.portfolio.slice(0, 3).map((item) => (
                        <PhotoPlaceholder
                          key={item.id}
                          tone={item.tone}
                          aspect="1/1"
                          withCorners={false}
                          caption={{
                            number: item.number ?? "001",
                            event: item.event ?? item.caption,
                            aperture: item.aperture ?? "f/2.8",
                          }}
                          className="w-full"
                        />
                      ))}
                    </div>
                  );

                  return (
                    <PhotographerCard
                      key={ph.id}
                      name={ph.name}
                      avatarFallback={ph.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      avatarSrc={ph.avatarSrc}
                      verified={ph.verified}
                      city={ph.city}
                      specialisation={ph.specialisations.join(", ")}
                      startingPrice={getStartingPrice(ph.packages)}
                      nextFreeDate={`Free ${ph.nextFree}`}
                      compareChecked={isChecked}
                      compareDisabled={isCompareDisabled}
                      onCompareChange={(checked) => handleToggleCompare(ph.id, checked)}
                      onBook={() => {}}
                      photoStrip={photoStrip}
                    />
                  );
                })}
              </div>
            ) : (
              /* Empty state: No photographers match yet. Widen your city or event type. */
              <EmptyState
                message="No photographers match yet. Widen your city or event type."
                actionLabel="Reset all filters"
                onAction={resetFilters}
              />
            )}
          </main>
        </div>
      </div>

      {/* Quiet bottom bar when 1 or more photographers are selected for comparison */}
      {selectedForCompare.length > 0 && (
        <div
          role="region"
          aria-label="Compare photographers bar"
          className="fixed bottom-0 inset-x-0 bg-chalk border-t border-[#CFCFCB] py-3.5 px-6 z-30 shadow-menu animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs sm:text-sm text-slate">
                <span className="font-semibold text-midnight tabular-nums">
                  {selectedForCompare.length}
                </span>{" "}
                of 3 selected
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedForCompare([]);
                  setCompareNotice("");
                }}
                className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
              >
                Clear
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => {}}
            >
              Compare {selectedForCompare.length}{" "}
              {selectedForCompare.length === 1 ? "photographer" : "photographers"}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Filters Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent
          onClose={() => setMobileFiltersOpen(false)}
          className="max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {filterControls}
          </div>

          <DialogFooter className="flex-row sm:flex-row justify-between gap-3 pt-4 border-t border-[#CFCFCB]">
            <Button
              variant="secondary"
              size="md"
              onClick={resetFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1"
            >
              Show {filteredPhotographers.length} results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
