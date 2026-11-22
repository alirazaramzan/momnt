"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type {
  SearchBudgetPreset,
  SearchPhotographerItem,
  SearchPhotographersResult,
  SearchRole,
  SearchSort,
} from "@/lib/search/photographers";
import { fetchComparePhotographersAction } from "./actions";
import { PhotographerCard, EmptyState } from "@/components/patterns";
import { PhotoPlaceholder, VerifiedBadge } from "@/components/brand";
import {
  Avatar,
  Button,
  Chip,
  Select,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { initials } from "@/lib/profiles/display";
import { formatPackageDetail } from "@/lib/validators/packages";

export interface PhotographersSearchClientProps {
  result: SearchPhotographersResult;
}

export function PhotographersSearchClient({
  result,
}: PhotographersSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const {
    filters,
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
    comparedPhotographers,
  } = result;

  // Local filter state synced with URL filters
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(filters.verifiedOnly);
  const [city, setCity] = useState<string>(filters.city);
  const [eventType, setEventType] = useState<string>(filters.eventType);
  const [style, setStyle] = useState<string>(filters.style);
  const [budget, setBudget] = useState<SearchBudgetPreset>(filters.budget);
  const [minBudgetInput, setMinBudgetInput] = useState<string>(
    filters.minBudget !== null ? String(filters.minBudget) : ""
  );
  const [maxBudgetInput, setMaxBudgetInput] = useState<string>(
    filters.maxBudget !== null ? String(filters.maxBudget) : ""
  );
  const [role, setRole] = useState<SearchRole>(filters.role);
  const [availableDate, setAvailableDate] = useState<string>(
    filters.availableDate
  );
  const [sortBy, setSortBy] = useState<SearchSort>(filters.sort);

  // Compare state (up to 3 photographers)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(
    filters.compareIds
  );
  const [fetchedCompareMap, setFetchedCompareMap] = useState<
    Record<string, SearchPhotographerItem>
  >({});
  const [compareNotice, setCompareNotice] = useState<string>("");
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);

  // Mobile filters dialog
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  const compareCache = useMemo(() => {
    const map: Record<string, SearchPhotographerItem> = {
      ...fetchedCompareMap,
    };
    for (const item of items) map[item.id] = item;
    for (const item of comparedPhotographers) map[item.id] = item;
    return map;
  }, [fetchedCompareMap, items, comparedPhotographers]);

  // Build URL query string and navigate
  const pushUrlState = (
    overrides: Partial<{
      verifiedOnly: boolean;
      city: string;
      eventType: string;
      style: string;
      budget: SearchBudgetPreset;
      minBudget: string;
      maxBudget: string;
      role: SearchRole;
      availableDate: string;
      sort: SearchSort;
      page: number;
      compareIds: string[];
    }>
  ) => {
    const nextVerified = overrides.verifiedOnly ?? verifiedOnly;
    const nextCity = overrides.city ?? city;
    const nextEvent = overrides.eventType ?? eventType;
    const nextStyle = overrides.style ?? style;
    const nextBudget = overrides.budget ?? budget;
    const nextMin = overrides.minBudget ?? minBudgetInput;
    const nextMax = overrides.maxBudget ?? maxBudgetInput;
    const nextRole = overrides.role ?? role;
    const nextDate = overrides.availableDate ?? availableDate;
    const nextSort = overrides.sort ?? sortBy;
    const nextPage = overrides.page ?? 1;
    const nextCompare = overrides.compareIds ?? selectedForCompare;

    const params = new URLSearchParams();
    if (!nextVerified) params.set("verified", "false");
    if (nextCity && nextCity !== "all") params.set("city", nextCity);
    if (nextEvent && nextEvent !== "all") params.set("eventType", nextEvent);
    if (nextStyle && nextStyle !== "all") params.set("style", nextStyle);
    if (nextBudget && nextBudget !== "all") params.set("budget", nextBudget);
    if (nextMin.trim() !== "") params.set("minBudget", nextMin.trim());
    if (nextMax.trim() !== "") params.set("maxBudget", nextMax.trim());
    if (nextRole && nextRole !== "all") params.set("role", nextRole);
    if (nextDate.trim() !== "") params.set("date", nextDate.trim());
    if (nextSort && nextSort !== "rating") params.set("sort", nextSort);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextCompare.length > 0) params.set("compare", nextCompare.join(","));

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleBudgetPresetChange = (value: string) => {
    const preset = value as SearchBudgetPreset;
    setBudget(preset);
    let minStr = "";
    let maxStr = "";
    if (preset === "under_75k") {
      maxStr = "74999";
    } else if (preset === "75k_150k") {
      minStr = "75000";
      maxStr = "150000";
    } else if (preset === "above_150k") {
      minStr = "150001";
    }
    setMinBudgetInput(minStr);
    setMaxBudgetInput(maxStr);
    pushUrlState({
      budget: preset,
      minBudget: minStr,
      maxBudget: maxStr,
      page: 1,
    });
  };

  const applyCustomBudget = (nextMin: string, nextMax: string) => {
    setBudget("all");
    pushUrlState({
      budget: "all",
      minBudget: nextMin,
      maxBudget: nextMax,
      page: 1,
    });
  };

  const resetFilters = () => {
    setVerifiedOnly(true);
    setCity("all");
    setEventType("all");
    setStyle("all");
    setBudget("all");
    setMinBudgetInput("");
    setMaxBudgetInput("");
    setRole("all");
    setAvailableDate("");
    setSortBy("rating");
    pushUrlState({
      verifiedOnly: true,
      city: "all",
      eventType: "all",
      style: "all",
      budget: "all",
      minBudget: "",
      maxBudget: "",
      role: "all",
      availableDate: "",
      sort: "rating",
      page: 1,
    });
  };

  const handleToggleCompare = (id: string, checked: boolean) => {
    let nextIds: string[];
    if (checked) {
      if (selectedForCompare.length >= 3) {
        setCompareNotice(
          "You can compare up to three photographers. Uncheck one to add another."
        );
        return;
      }
      setCompareNotice("");
      nextIds = [...selectedForCompare, id];
    } else {
      setCompareNotice("");
      nextIds = selectedForCompare.filter((item) => item !== id);
    }
    setSelectedForCompare(nextIds);
    pushUrlState({ compareIds: nextIds, page });
  };

  const handleOpenCompare = async () => {
    if (selectedForCompare.length === 0) return;
    setCompareOpen(true);

    const missingIds = selectedForCompare.filter((id) => !compareCache[id]);
    if (missingIds.length > 0) {
      setCompareLoading(true);
      try {
        const fetched = await fetchComparePhotographersAction(
          selectedForCompare
        );
        setFetchedCompareMap((prev) => {
          const next = { ...prev };
          for (const item of fetched) next[item.id] = item;
          return next;
        });
      } finally {
        setCompareLoading(false);
      }
    }
  };

  const activeComparedItems = selectedForCompare
    .map((id) => compareCache[id])
    .filter((item): item is SearchPhotographerItem => Boolean(item));

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(totalCount, page * pageSize);

  const filterControls = (
    <div className="space-y-5 text-left">
      {/* 1. Verified Only Checkbox (on by default) */}
      <div className="pt-1 pb-3 border-b border-[#CFCFCB]">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            id="filter-verified"
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setVerifiedOnly(checked);
              pushUrlState({ verifiedOnly: checked, page: 1 });
            }}
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
          onChange={(e) => {
            const val = e.target.value;
            setCity(val);
            pushUrlState({ city: val, page: 1 });
          }}
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
          onChange={(e) => {
            const val = e.target.value;
            setEventType(val);
            pushUrlState({ eventType: val, page: 1 });
          }}
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
          onChange={(e) => {
            const val = e.target.value;
            setStyle(val);
            pushUrlState({ style: val, page: 1 });
          }}
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

      {/* 5. Budget Range (preset + min/max PKR) */}
      <div className="space-y-2">
        <Label htmlFor="filter-budget">Budget range</Label>
        <Select
          id="filter-budget"
          value={budget}
          onChange={(e) => handleBudgetPresetChange(e.target.value)}
        >
          <option value="all">Any budget</option>
          <option value="under_75k">Under PKR 75,000</option>
          <option value="75k_150k">PKR 75,000 – 150,000</option>
          <option value="above_150k">Above PKR 150,000</option>
        </Select>
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div>
            <Label htmlFor="filter-min-budget" className="text-xs text-slate">
              Min PKR
            </Label>
            <Input
              id="filter-min-budget"
              type="number"
              min={0}
              step={5000}
              value={minBudgetInput}
              onChange={(e) => setMinBudgetInput(e.target.value)}
              onBlur={() => applyCustomBudget(minBudgetInput, maxBudgetInput)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyCustomBudget(minBudgetInput, maxBudgetInput);
                }
              }}
              placeholder="e.g. 50000"
              className="tabular-nums text-xs h-9"
            />
          </div>
          <div>
            <Label htmlFor="filter-max-budget" className="text-xs text-slate">
              Max PKR
            </Label>
            <Input
              id="filter-max-budget"
              type="number"
              min={0}
              step={5000}
              value={maxBudgetInput}
              onChange={(e) => setMaxBudgetInput(e.target.value)}
              onBlur={() => applyCustomBudget(minBudgetInput, maxBudgetInput)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyCustomBudget(minBudgetInput, maxBudgetInput);
                }
              }}
              placeholder="e.g. 150000"
              className="tabular-nums text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* 6. Photographer or Videographer */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-role">Professional</Label>
        <Select
          id="filter-role"
          value={role}
          onChange={(e) => {
            const val = e.target.value as SearchRole;
            setRole(val);
            pushUrlState({ role: val, page: 1 });
          }}
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
          type="date"
          value={availableDate}
          onChange={(e) => {
            const val = e.target.value;
            setAvailableDate(val);
            pushUrlState({ availableDate: val, page: 1 });
          }}
          className="tabular-nums"
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
                {totalCount > pageSize
                  ? `Showing ${rangeStart}–${rangeEnd} of ${totalCount} photographers`
                  : `Showing ${totalCount} ${
                      totalCount === 1 ? "photographer" : "photographers"
                    }`}
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
                  <Label
                    htmlFor="sort-select"
                    className="text-xs text-slate hidden sm:inline-block"
                  >
                    Sort by
                  </Label>
                  <Select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      const val = e.target.value as SearchSort;
                      setSortBy(val);
                      pushUrlState({ sort: val, page: 1 });
                    }}
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
            {items.length > 0 ? (
              <div
                className={`space-y-4 transition-opacity duration-200 ${
                  isPending ? "opacity-60" : "opacity-100"
                }`}
              >
                {items.map((ph) => {
                  const isChecked = selectedForCompare.includes(ph.id);
                  const isCompareDisabled =
                    selectedForCompare.length >= 3 && !isChecked;

                  // 3-photo strip on the right
                  const photoStrip = (
                    <Link
                      href={`/photographers/${ph.id}`}
                      aria-label={`View ${ph.name} portfolio`}
                      className="grid grid-cols-3 gap-2 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
                    >
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
                    </Link>
                  );

                  const dateParam = availableDate
                    ? `?date=${encodeURIComponent(availableDate)}`
                    : "";

                  return (
                    <PhotographerCard
                      key={ph.id}
                      name={ph.name}
                      avatarFallback={initials(ph.name)}
                      avatarSrc={ph.avatarSrc}
                      verified={ph.verified}
                      city={ph.city}
                      specialisation={ph.specialisations.join(", ")}
                      startingPrice={ph.startingPrice}
                      nextFreeDate={
                        availableDate
                          ? `Available ${ph.nextFree}`
                          : `Free ${ph.nextFree}`
                      }
                      compareChecked={isChecked}
                      compareDisabled={isCompareDisabled}
                      onCompareChange={(checked) =>
                        handleToggleCompare(ph.id, checked)
                      }
                      onBook={() =>
                        router.push(`/book/${ph.id}${dateParam}`)
                      }
                      photoStrip={photoStrip}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                message="No photographers match yet. Widen your city or event type."
                actionLabel="Reset all filters"
                onAction={resetFilters}
              />
            )}

            {/* Pagination controls (12 per page) */}
            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#CFCFCB]"
              >
                <p className="font-sans text-xs text-slate tabular-nums">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || isPending}
                    onClick={() => pushUrlState({ page: page - 1 })}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pNum) => (
                      <Button
                        key={pNum}
                        variant={pNum === page ? "primary" : "secondary"}
                        size="sm"
                        disabled={isPending}
                        onClick={() => pushUrlState({ page: pNum })}
                        className="tabular-nums min-w-9"
                      >
                        {pNum}
                      </Button>
                    )
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages || isPending}
                    onClick={() => pushUrlState({ page: page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </nav>
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
                  pushUrlState({ compareIds: [], page });
                }}
                className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
              >
                Clear
              </button>
            </div>

            <Button variant="primary" size="md" onClick={handleOpenCompare}>
              Compare {selectedForCompare.length}{" "}
              {selectedForCompare.length === 1
                ? "photographer"
                : "photographers"}
            </Button>
          </div>
        </div>
      )}

      {/* Side-by-side Comparison Dialog (up to 3 photographers) */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent
          onClose={() => setCompareOpen(false)}
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              Compare photographers ({activeComparedItems.length} of 3)
            </DialogTitle>
          </DialogHeader>

          {compareLoading ? (
            <div className="py-8 font-sans text-sm text-slate">
              Loading comparison details...
            </div>
          ) : activeComparedItems.length === 0 ? (
            <div className="py-6 font-sans text-sm text-slate">
              Select up to three photographers to compare their packages, styles
              and availability side by side.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Detail</TableHead>
                    {activeComparedItems.map((ph) => (
                      <TableHead key={ph.id} className="min-w-[220px] align-top">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <Avatar
                              src={ph.avatarSrc}
                              fallback={initials(ph.name)}
                              size="sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleToggleCompare(ph.id, false)}
                              className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link
                              href={`/photographers/${ph.id}`}
                              className="font-sans text-sm font-semibold text-midnight hover:underline"
                            >
                              {ph.name}
                            </Link>
                            {ph.verified && <VerifiedBadge variant="solid" />}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      City &amp; role
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id}>
                        {ph.city} &middot;{" "}
                        {ph.isVideographer ? "Videographer" : "Photographer"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Starting price
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell
                        key={ph.id}
                        className="font-semibold text-midnight tabular-nums"
                      >
                        PKR {ph.startingPrice.toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Rating &amp; experience
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id} className="tabular-nums">
                        {ph.reviewCount > 0
                          ? `${ph.rating.toFixed(1)} / 5 (${ph.reviewCount} ${
                              ph.reviewCount === 1 ? "review" : "reviews"
                            })`
                          : "No reviews yet"}
                        {ph.yearsExperience !== null
                          ? ` · ${ph.yearsExperience} yrs exp`
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Event types
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id}>
                        {ph.specialisations.join(", ") || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Styles
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id}>
                        {ph.styles.join(", ") || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Next free date
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id}>
                        <Chip variant="neutral" size="sm">
                          Free {ph.nextFree}
                        </Chip>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate align-top">
                      Packages
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id} className="align-top">
                        <div className="space-y-2">
                          {ph.packages.map((pkg) => (
                            <div
                              key={pkg.id ?? pkg.name}
                              className="p-2.5 rounded-[2px] border border-[#CFCFCB] space-y-0.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-sans text-xs font-semibold text-midnight">
                                  {pkg.name}
                                </span>
                                <span className="font-sans text-xs font-semibold text-midnight tabular-nums">
                                  PKR {pkg.price.toLocaleString()}
                                </span>
                              </div>
                              <p className="font-sans text-[11px] text-slate">
                                {formatPackageDetail({
                                  hours: pkg.hours,
                                  photographers: pkg.photographers,
                                  editedPhotos: pkg.editedPhotos,
                                  deliveryTime: pkg.deliveryTime,
                                  addons: pkg.addons,
                                })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-slate">
                      Action
                    </TableCell>
                    {activeComparedItems.map((ph) => (
                      <TableCell key={ph.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setCompareOpen(false);
                              router.push(`/book/${ph.id}`);
                            }}
                          >
                            Book this date
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setCompareOpen(false);
                              router.push(`/photographers/${ph.id}`);
                            }}
                          >
                            View profile
                          </Button>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCompareOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Filters Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent
          onClose={() => setMobileFiltersOpen(false)}
          className="max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="py-2">{filterControls}</div>

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
              Show {totalCount} results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

