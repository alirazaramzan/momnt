"use client";

import React, { useState } from "react";
import {
  Logo,
  Seal,
  VerifiedBadge,
  CropMarks,
  CameraCaption,
  GoldDot,
  PhotoPlaceholder,
} from "@/components/brand";
import {
  Button,
  Input,
  Textarea,
  Select,
  Label,
  Chip,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Stepper,
  Avatar,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Toast,
} from "@/components/ui";
import {
  MonthCalendar,
  PhotoGrid,
  PackageRow,
  PhotographerCard,
  FormField,
  EmptyState,
  SectionHeader,
} from "@/components/patterns";

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState<number | null>(14);
  const [favourites, setFavourites] = useState<(string | number)[]>([101, 103]);
  const [selectedPackage, setSelectedPackage] = useState<string>("mehndi");

  const samplePhotos = [
    { id: 101, number: "101", tone: "warm" as const, event: "Mehndi", aperture: "f/1.8" },
    { id: 102, number: "102", tone: "midnight" as const, event: "Baraat", aperture: "f/2.8" },
    { id: 103, number: "103", tone: "slate" as const, event: "Walima", aperture: "f/1.4" },
    { id: 104, number: "104", tone: "dune" as const, event: "Nikkah", aperture: "f/2.0" },
  ];

  const handleToggleFavourite = (id: string | number) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const colors = [
    { name: "midnight", hex: "#0A1428", role: "Primary text on light, background on dark, solid primary button on light" },
    { name: "chalk", hex: "#F1F0EC", role: "Background on light, primary text on dark, solid primary button on dark" },
    { name: "brass", hex: "#C2A267", role: "Hairlines, crop marks, gold dot, active tab underlines only" },
    { name: "mist", hex: "#E3E5E8", role: "Skeleton loading states" },
    { name: "slate", hex: "#5B6578", role: "Caption text (13/18)" },
    { name: "verified", hex: "#1E7A5C", role: "Verified, paid, and delivered states only" },
    { name: "alert", hex: "#B4423A", role: "Errors and rejected states only" },
  ];

  const supportingTokens = [
    { name: "dark secondary", hex: "#9AA3B5", role: "Dark-surface secondary text" },
    { name: "dark hairline", hex: "#26324A", role: "Dark-surface 1px border" },
    { name: "light hairline", hex: "#CFCFCB", role: "Light-surface 1px border" },
  ];

  const sampleBids = [
    { photographer: "Sara Khan", city: "Karachi", bid: "PKR 145,000", rating: "4.9", time: "1 hour", dateStatus: "Available" },
    { photographer: "Omar Siddiqui", city: "Lahore", bid: "PKR 160,000", rating: "4.7", time: "3 hours", dateStatus: "Available" },
    { photographer: "Hira Anwar", city: "Islamabad", bid: "PKR 135,000", rating: "4.8", time: "1 day", dateStatus: "Available" },
  ];

  return (
    <div className="min-h-screen bg-chalk text-midnight">
      {/* Top Header */}
      <header className="border-b border-[#CFCFCB] px-6 py-6">
        <div className="mx-auto max-w-[1120px] flex items-center justify-between">
          <Logo size="md" withUrdu />
          <div className="flex items-center gap-3">
            <VerifiedBadge />
            <span className="hidden sm:inline font-sans text-[13px] text-slate">
              Design system reference
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container: max-w 1120px, page margin 24px (px-6) */}
      <main className="mx-auto max-w-[1120px] px-6 py-12 space-y-24">

        {/* SECTION 1: Brand tokens & color rules */}
        <section className="space-y-8">
          <div>
            <h1 className="font-display text-[40px] leading-tight text-midnight">
              Brand tokens
            </h1>
            <p className="mt-2 font-sans text-[16px] leading-[26px] text-slate max-w-2xl">
              Seven colours only. No other colours or gradient fills are permitted anywhere in the platform, except within the photo placeholder component.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {colors.map((c) => (
              <div
                key={c.name}
                className="border border-[#CFCFCB] rounded-[2px] p-4 bg-chalk space-y-3"
              >
                <div
                  className="h-16 w-full rounded-[2px] border border-[#CFCFCB]"
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-medium text-[16px] text-midnight capitalize">
                      {c.name}
                    </span>
                    <span className="font-sans text-[13px] tabular-nums text-slate">
                      {c.hex}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-[13px] leading-[18px] text-slate">
                    {c.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#CFCFCB] pt-6">
            <h2 className="font-sans text-[18px] font-semibold text-midnight mb-4">
              Hairline and dark secondary tokens
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {supportingTokens.map((t) => (
                <div
                  key={t.name}
                  className="border border-[#CFCFCB] rounded-[2px] p-4 bg-chalk space-y-3"
                >
                  <div
                    className="h-10 w-full rounded-[2px] border border-[#CFCFCB]"
                    style={{ backgroundColor: t.hex }}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-medium text-[14px] text-midnight capitalize">
                        {t.name}
                      </span>
                      <span className="font-sans text-[13px] tabular-nums text-slate">
                        {t.hex}
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-[13px] leading-[18px] text-slate">
                      {t.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Core UI Components Showcase on BOTH Surfaces */}
        <section className="space-y-12">
          <div>
            <h2 className="font-display text-[32px] leading-tight text-midnight">
              Core UI components
            </h2>
            <p className="mt-2 font-sans text-[16px] leading-[26px] text-slate max-w-2xl">
              Clean 2px radius on inputs, buttons and cards. Round chips. 2px focus ring with 2px offset. Every component demonstrated on both light and dark surfaces.
            </p>
          </div>

          {/* TAB SYSTEM FOR SWITCHING SURFACES OR SIDE-BY-SIDE */}
          <Tabs defaultValue="both" className="w-full">
            <TabsList>
              <TabsTrigger value="both">Side-by-side comparison</TabsTrigger>
              <TabsTrigger value="light">Light surface only</TabsTrigger>
              <TabsTrigger value="dark">Dark surface only</TabsTrigger>
            </TabsList>

            {/* SHARED SURFACE RENDER HELPER */}
            {["both", "light", "dark"].map((tabVal) => (
              <TabsContent key={tabVal} value={tabVal} className="space-y-12 mt-6">
                <div className={tabVal === "both" ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-8"}>

                  {/* LIGHT SURFACE PANEL */}
                  {(tabVal === "both" || tabVal === "light") && (
                    <div
                      data-surface="light"
                      className="border border-[#CFCFCB] rounded-[2px] p-8 bg-chalk text-midnight space-y-12"
                    >
                      <div className="flex items-center justify-between border-b border-[#CFCFCB] pb-4">
                        <div>
                          <span className="font-sans text-xs uppercase tracking-wider text-slate block">
                            Surface: Light
                          </span>
                          <span className="font-sans text-sm font-semibold text-midnight">
                            Chalk ground with midnight text
                          </span>
                        </div>
                        <GoldDot />
                      </div>

                      {/* 1. BUTTONS */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          1. Button variants &amp; states
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Primary is solid midnight on light. Secondary is 1px outline. Quiet is borderless text.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="primary" size="md">Primary md</Button>
                          <Button variant="primary" size="lg">Primary lg</Button>
                          <Button variant="secondary" size="md">Secondary</Button>
                          <Button variant="quiet" size="md">Quiet text</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button variant="primary" size="md" loading>Loading</Button>
                          <Button variant="primary" size="md" disabled>Disabled</Button>
                          <Button variant="secondary" size="md" disabled>Disabled</Button>
                          <Button variant="destructive" size="md">Alert button</Button>
                        </div>
                      </div>

                      {/* 2. CHIPS */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          2. Chips (fully round)
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Neutral, verified, brass-outline (&quot;Under review&quot;), alert.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip variant="neutral">Pending</Chip>
                          <Chip variant="brass-outline" dot>Under review</Chip>
                          <Chip variant="verified" dot>Verified</Chip>
                          <Chip variant="verified-solid">Deposit paid</Chip>
                          <Chip variant="alert" dot>Rejected</Chip>
                        </div>
                      </div>

                      {/* 3. FORMS: Input, Textarea, Select, Label */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          3. Form fields (2px radius, 2px focus outline)
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="light-event">Event type</Label>
                            <Input id="light-event" placeholder="e.g. Mehndi, Nikkah, Baraat" />
                          </div>
                          <div>
                            <Label htmlFor="light-city">City</Label>
                            <Select id="light-city" defaultValue="karachi">
                              <option value="karachi">Karachi</option>
                              <option value="lahore">Lahore</option>
                              <option value="islamabad">Islamabad</option>
                              <option value="peshawar">Peshawar</option>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="light-notes" optional>Special requirements</Label>
                            <Textarea id="light-notes" placeholder="Window light preferred, 200 guests..." />
                          </div>
                          <div>
                            <Label htmlFor="light-disabled">Disabled field</Label>
                            <Input id="light-disabled" value="Verified and locked by admin" disabled />
                          </div>
                        </div>
                      </div>

                      {/* 4. CARD */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          4. Card (1px hairline, no shadow)
                        </h3>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Sara Khan</CardTitle>
                              <Chip variant="verified" dot>Verified</Chip>
                            </div>
                            <CardDescription>Karachi, weddings and portraits</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate">Mehndi package (6 hours)</span>
                              <span className="font-semibold tabular-nums text-midnight">PKR 145,000</span>
                            </div>
                            <p className="mt-2 text-xs text-slate">
                              Includes 2 photographers, 300 edited frames, online proofing gallery.
                            </p>
                          </CardContent>
                          <CardFooter className="justify-between">
                            <span className="text-xs text-slate">Free on 14 Dec</span>
                            <Button variant="primary" size="sm">Request date</Button>
                          </CardFooter>
                        </Card>
                      </div>

                      {/* 5. TABLE */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          5. Table (hairline rows, 12px sentence-case slate headers)
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Photographer</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Bid amount</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleBids.map((row) => (
                              <TableRow key={row.photographer}>
                                <TableCell className="font-medium text-midnight">{row.photographer}</TableCell>
                                <TableCell className="text-slate">{row.city}</TableCell>
                                <TableCell className="font-medium">{row.bid}</TableCell>
                                <TableCell>{row.rating}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="secondary" size="sm">Shortlist</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* 6. STEPPER */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          6. Stepper (status path)
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Status path shown as round chips. Current active status is filled.
                        </p>
                        <Stepper
                          steps={["Requested", "Accepted", "Deposit", "Delivered"]}
                          currentStep={1}
                        />
                      </div>

                      {/* 7. AVATAR & SKELETON */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          7. Avatar &amp; Skeleton (mist)
                        </h3>
                        <div className="flex items-center gap-4">
                          <Avatar fallback="SK" size="lg" />
                          <Avatar fallback="AR" size="md" />
                          <Avatar fallback="OS" size="sm" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* 8. DIALOG & TOAST TRIGGER */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          8. Dialog &amp; Toast (soft menu shadow)
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                          <Button variant="primary" onClick={() => setDialogOpen(true)}>
                            Open dialog demo
                          </Button>
                          <Button variant="secondary" onClick={() => setToastVisible((v) => !v)}>
                            {toastVisible ? "Hide toast" : "Show toast"}
                          </Button>
                        </div>
                        {toastVisible && (
                          <div className="pt-2">
                            <Toast
                              variant="verified"
                              title="Booking confirmed"
                              description="Sara Khan accepted your request for 14 December in Clifton, Karachi."
                              onClose={() => setToastVisible(false)}
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* DARK SURFACE PANEL */}
                  {(tabVal === "both" || tabVal === "dark") && (
                    <div
                      data-surface="dark"
                      className="border border-[#26324A] rounded-[2px] p-8 bg-midnight text-chalk space-y-12"
                    >
                      <div className="flex items-center justify-between border-b border-[#26324A] pb-4">
                        <div>
                          <span className="font-sans text-xs uppercase tracking-wider text-[#9AA3B5] block">
                            Surface: Dark (data-surface=&quot;dark&quot;)
                          </span>
                          <span className="font-sans text-sm font-semibold text-chalk">
                            Midnight ground with chalk text
                          </span>
                        </div>
                        <GoldDot />
                      </div>

                      {/* 1. BUTTONS */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          1. Button variants &amp; states
                        </h3>
                        <p className="font-sans text-xs text-[#9AA3B5]">
                          Primary is solid chalk on dark. Secondary is 1px outline. Quiet is borderless text.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="primary" size="md">Primary md</Button>
                          <Button variant="primary" size="lg">Primary lg</Button>
                          <Button variant="secondary" size="md">Secondary</Button>
                          <Button variant="quiet" size="md">Quiet text</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button variant="primary" size="md" loading>Loading</Button>
                          <Button variant="primary" size="md" disabled>Disabled</Button>
                          <Button variant="secondary" size="md" disabled>Disabled</Button>
                          <Button variant="destructive" size="md">Alert button</Button>
                        </div>
                      </div>

                      {/* 2. CHIPS */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          2. Chips (fully round)
                        </h3>
                        <p className="font-sans text-xs text-[#9AA3B5]">
                          Neutral, verified, brass-outline (&quot;Under review&quot;), alert.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip variant="neutral">Pending</Chip>
                          <Chip variant="brass-outline" dot>Under review</Chip>
                          <Chip variant="verified" dot>Verified</Chip>
                          <Chip variant="verified-solid">Deposit paid</Chip>
                          <Chip variant="alert" dot>Rejected</Chip>
                        </div>
                      </div>

                      {/* 3. FORMS: Input, Textarea, Select, Label */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          3. Form fields (2px radius, 2px focus outline)
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="dark-event">Event type</Label>
                            <Input id="dark-event" placeholder="e.g. Mehndi, Nikkah, Baraat" />
                          </div>
                          <div>
                            <Label htmlFor="dark-city">City</Label>
                            <Select id="dark-city" defaultValue="lahore">
                              <option value="karachi" className="bg-midnight text-chalk">Karachi</option>
                              <option value="lahore" className="bg-midnight text-chalk">Lahore</option>
                              <option value="islamabad" className="bg-midnight text-chalk">Islamabad</option>
                              <option value="peshawar" className="bg-midnight text-chalk">Peshawar</option>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="dark-notes" optional>Special requirements</Label>
                            <Textarea id="dark-notes" placeholder="Low-light prime lenses required..." />
                          </div>
                          <div>
                            <Label htmlFor="dark-disabled">Disabled field</Label>
                            <Input id="dark-disabled" value="Proofing session locked" disabled />
                          </div>
                        </div>
                      </div>

                      {/* 4. CARD */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          4. Card (1px hairline, no shadow)
                        </h3>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Proofing Gallery</CardTitle>
                              <Chip variant="verified" dot>38 of 60 picked</Chip>
                            </div>
                            <CardDescription>Sara &amp; Ahmed, Mehndi session</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#9AA3B5]">Total frames uploaded</span>
                              <span className="font-semibold tabular-nums text-chalk">412 frames</span>
                            </div>
                            <p className="mt-2 text-xs text-[#9AA3B5]">
                              Dark surface ensures unbiased color judgment under low light conditions.
                            </p>
                          </CardContent>
                          <CardFooter className="justify-between">
                            <span className="text-xs text-[#9AA3B5]">Closes on 20 Dec</span>
                            <Button variant="primary" size="sm">Submit selection</Button>
                          </CardFooter>
                        </Card>
                      </div>

                      {/* 5. TABLE */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          5. Table (hairline rows, 12px sentence-case slate headers)
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Photographer</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Bid amount</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleBids.map((row) => (
                              <TableRow key={row.photographer}>
                                <TableCell className="font-medium text-chalk">{row.photographer}</TableCell>
                                <TableCell className="text-[#9AA3B5]">{row.city}</TableCell>
                                <TableCell className="font-medium">{row.bid}</TableCell>
                                <TableCell>{row.rating}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="secondary" size="sm">Shortlist</Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* 6. STEPPER */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          6. Stepper (status path)
                        </h3>
                        <p className="font-sans text-xs text-[#9AA3B5]">
                          Status path shown as round chips. Current active status is filled chalk.
                        </p>
                        <Stepper
                          steps={["Requested", "Accepted", "Deposit", "Delivered"]}
                          currentStep={2}
                        />
                      </div>

                      {/* 7. AVATAR & SKELETON */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          7. Avatar &amp; Skeleton
                        </h3>
                        <div className="flex items-center gap-4">
                          <Avatar fallback="SK" size="lg" />
                          <Avatar fallback="AR" size="md" />
                          <Avatar fallback="OS" size="sm" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* 8. TOAST PREVIEW ON DARK */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          8. Toast notification on dark surface
                        </h3>
                        <Toast
                          variant="alert"
                          title="Shot list update required"
                          description="3 essential group portraits have not been marked complete yet."
                        />
                      </div>

                    </div>
                  )}

                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* SECTION 3: Brand components detail */}
        <section className="space-y-12">
          <div>
            <h2 className="font-display text-[32px] leading-tight text-midnight">
              Brand components
            </h2>
            <p className="mt-2 font-sans text-[16px] leading-[26px] text-slate max-w-2xl">
              All visual elements adhere strictly to the 2px radius rule, 1px hairlines, and the six authorized decorative elements.
            </p>
          </div>

          {/* Component: Logo / Wordmark */}
          <div className="border border-[#CFCFCB] rounded-[2px] p-6 space-y-6">
            <div className="border-b border-[#CFCFCB] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <h3 className="font-sans text-[18px] font-semibold text-midnight">
                1. Wordmark (Logo)
              </h3>
              <span className="font-sans text-[13px] text-slate">
                Bodoni Moda &bull; Brass full stop &bull; Min 72px width
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="p-8 bg-chalk border border-[#CFCFCB] rounded-[2px] flex flex-col items-start gap-4">
                <span className="font-sans text-[13px] text-slate">Standard wordmark with optional Urdu</span>
                <Logo size="lg" withUrdu />
              </div>

              <div className="p-8 bg-chalk border border-[#CFCFCB] rounded-[2px] flex flex-col items-start gap-4">
                <span className="font-sans text-[13px] text-slate">With 26px brass crop marks</span>
                <Logo size="lg" withCropMarks />
              </div>
            </div>
          </div>

          {/* Component: Seal & VerifiedBadge */}
          <div className="border border-[#CFCFCB] rounded-[2px] p-6 space-y-6">
            <div className="border-b border-[#CFCFCB] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <h3 className="font-sans text-[18px] font-semibold text-midnight">
                2. Seal &amp; VerifiedBadge
              </h3>
              <span className="font-sans text-[13px] text-slate">
                Focus mark &bull; Scalable &bull; Strictly verified green chip
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Scalable Seal */}
              <div className="p-6 bg-chalk border border-[#CFCFCB] rounded-[2px] space-y-4">
                <span className="font-sans text-[13px] text-slate">
                  Seal (four corner brackets around brass dot)
                </span>
                <div className="flex items-center gap-6 text-midnight">
                  <div className="flex flex-col items-center gap-1">
                    <Seal size={14} />
                    <span className="font-sans text-[11px] text-slate">14px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Seal size={24} />
                    <span className="font-sans text-[11px] text-slate">24px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Seal size={32} />
                    <span className="font-sans text-[11px] text-slate">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Seal size={48} />
                    <span className="font-sans text-[11px] text-slate">48px</span>
                  </div>
                </div>
              </div>

              {/* VerifiedBadge */}
              <div className="p-6 bg-chalk border border-[#CFCFCB] rounded-[2px] space-y-4">
                <span className="font-sans text-[13px] text-slate">
                  VerifiedBadge (14px seal + &quot;Verified&quot;, round chip)
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <VerifiedBadge variant="solid" />
                  <VerifiedBadge variant="outline" />
                </div>
                <p className="font-sans text-[13px] leading-[18px] text-slate">
                  Never appears in any colour other than verified green (#1E7A5C).
                </p>
              </div>
            </div>
          </div>

          {/* Component: CropMarks & GoldDot */}
          <div className="border border-[#CFCFCB] rounded-[2px] p-6 space-y-6">
            <div className="border-b border-[#CFCFCB] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <h3 className="font-sans text-[18px] font-semibold text-midnight">
                3. CropMarks, GoldDot &amp; CameraCaption
              </h3>
              <span className="font-sans text-[13px] text-slate">
                Corners only &bull; 8px brass dot &bull; Manrope tabular numbers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CropMarks */}
              <div className="p-6 bg-chalk border border-[#CFCFCB] rounded-[2px] flex flex-col justify-between gap-4">
                <span className="font-sans text-[13px] text-slate">
                  CropMarks (four 26px brass corners)
                </span>
                <div className="py-2">
                  <CropMarks className="p-6">
                    <div className="text-center font-sans text-[14px] text-midnight">
                      Framed content
                    </div>
                  </CropMarks>
                </div>
                <span className="font-sans text-[11px] text-slate">
                  Corners only, never a closed box
                </span>
              </div>

              {/* GoldDot */}
              <div className="p-6 bg-chalk border border-[#CFCFCB] rounded-[2px] flex flex-col justify-between gap-4">
                <span className="font-sans text-[13px] text-slate">
                  GoldDot (8px brass dot)
                </span>
                <div className="flex items-center gap-3">
                  <GoldDot size={8} />
                  <span className="font-sans text-[14px] text-midnight">Active status mark</span>
                </div>
                <span className="font-sans text-[11px] text-slate">
                  Used for status, crop marks, and active tabs
                </span>
              </div>

              {/* CameraCaption */}
              <div className="p-6 bg-chalk border border-[#CFCFCB] rounded-[2px] flex flex-col justify-between gap-4">
                <span className="font-sans text-[13px] text-slate">
                  CameraCaption (13/18 caption in slate)
                </span>
                <div className="space-y-2">
                  <div>
                    <CameraCaption number="014" event="Mehndi" aperture="f/1.8" />
                  </div>
                  <div>
                    <CameraCaption number="102" event="Walima" aperture="f/1.4" />
                  </div>
                </div>
                <span className="font-sans text-[11px] text-slate">
                  Manrope with tabular numbers
                </span>
              </div>
            </div>
          </div>

          {/* Component: PhotoPlaceholder */}
          <div className="border border-[#CFCFCB] rounded-[2px] p-6 space-y-6">
            <div className="border-b border-[#CFCFCB] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <h3 className="font-sans text-[18px] font-semibold text-midnight">
                4. PhotoPlaceholder
              </h3>
              <span className="font-sans text-[13px] text-slate">
                Allowed tones: warm, midnight, slate, dune &bull; Aspect &bull; Caption &bull; Credit
              </span>
            </div>

            <p className="font-sans text-[13px] text-slate">
              No hotlinked stock photos. Use the PhotoPlaceholder component until real images exist. Always credit the photographer beside their work.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Tone: Warm */}
              <div className="space-y-2">
                <span className="font-sans text-[13px] font-medium text-midnight capitalize">
                  Tone: warm
                </span>
                <PhotoPlaceholder
                  tone="warm"
                  aspect="4/3"
                  credit="Photo by Tariq A."
                  caption={{ number: "001", event: "Nikkah", aperture: "f/1.4" }}
                />
              </div>

              {/* Tone: Midnight */}
              <div className="space-y-2">
                <span className="font-sans text-[13px] font-medium text-midnight capitalize">
                  Tone: midnight
                </span>
                <PhotoPlaceholder
                  tone="midnight"
                  aspect="4/3"
                  credit="Photo by Zainab K."
                  caption={{ number: "019", event: "Reception", aperture: "f/1.8" }}
                />
              </div>

              {/* Tone: Slate */}
              <div className="space-y-2">
                <span className="font-sans text-[13px] font-medium text-midnight capitalize">
                  Tone: slate
                </span>
                <PhotoPlaceholder
                  tone="slate"
                  aspect="4/3"
                  credit="Photo by Bilal M."
                  caption={{ number: "045", event: "Qawwali", aperture: "f/2.0" }}
                />
              </div>

              {/* Tone: Dune */}
              <div className="space-y-2">
                <span className="font-sans text-[13px] font-medium text-midnight capitalize">
                  Tone: dune
                </span>
                <PhotoPlaceholder
                  tone="dune"
                  aspect="4/3"
                  credit="Photo by Sana H."
                  caption={{ number: "088", event: "Shendi", aperture: "f/1.4" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Pattern components */}
        <section className="space-y-12">
          <SectionHeader
            title="Pattern components"
            lede="Composed patterns in /components/patterns built from brand tokens and core UI. Demonstrated on both light and dark surfaces."
            withBrassHairline
          />

          <Tabs defaultValue="both-patterns" className="w-full">
            <TabsList>
              <TabsTrigger value="both-patterns">Side-by-side surfaces</TabsTrigger>
              <TabsTrigger value="light-patterns">Light surface only</TabsTrigger>
              <TabsTrigger value="dark-patterns">Dark surface only</TabsTrigger>
            </TabsList>

            {["both-patterns", "light-patterns", "dark-patterns"].map((tabVal) => (
              <TabsContent key={tabVal} value={tabVal} className="space-y-12 mt-6">
                <div className={tabVal === "both-patterns" ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-8"}>

                  {/* LIGHT SURFACE PATTERNS */}
                  {(tabVal === "both-patterns" || tabVal === "light-patterns") && (
                    <div
                      data-surface="light"
                      className="border border-[#CFCFCB] rounded-[2px] p-8 bg-chalk text-midnight space-y-12"
                    >
                      <div className="flex items-center justify-between border-b border-[#CFCFCB] pb-4">
                        <span className="font-sans text-xs uppercase tracking-wider text-slate">
                          Patterns on Light Surface
                        </span>
                        <GoldDot />
                      </div>

                      {/* 1. MonthCalendar */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          1. MonthCalendar
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Keyboard navigable with accessible labels. Click or press Enter to pick a date.
                        </p>
                        <MonthCalendar
                          month="December"
                          year={2026}
                          daysCount={31}
                          firstDayOffset={1}
                          bookedDates={[4, 5, 11, 12, 19, 26]}
                          selectedDate={selectedDate}
                          onSelect={setSelectedDate}
                        />
                        <p className="font-sans text-xs text-slate tabular-nums">
                          Selected date: {selectedDate ? `${selectedDate} December 2026` : "None"}
                        </p>
                      </div>

                      {/* 2. PhotoGrid */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          2. PhotoGrid
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Frame numbers bottom-left. Click tile to toggle favourite GoldDot top-right.
                        </p>
                        <PhotoGrid
                          items={samplePhotos}
                          favourites={favourites}
                          onToggle={handleToggleFavourite}
                        />
                      </div>

                      {/* 3. PackageRow */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          3. PackageRow
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Selected package has a 3px brass bar on the left edge and midnight border.
                        </p>
                        <div className="space-y-2">
                          <PackageRow
                            name="Mehndi coverage (6 hours)"
                            detail="2 photographers, 300 edited frames, proofing gallery"
                            price={145000}
                            selected={selectedPackage === "mehndi"}
                            onClick={() => setSelectedPackage("mehndi")}
                          />
                          <PackageRow
                            name="Full wedding (3 days)"
                            detail="Mehndi, Baraat, Walima with album and raw archive"
                            price={380000}
                            selected={selectedPackage === "full"}
                            onClick={() => setSelectedPackage("full")}
                          />
                        </div>
                      </div>

                      {/* 4. PhotographerCard */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          4. PhotographerCard
                        </h3>
                        <p className="font-sans text-xs text-slate">
                          Shows VerifiedBadge strictly when verified is true. Name in display serif at 24px.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <PhotographerCard
                            name="Sara Khan"
                            avatarFallback="SK"
                            verified={true}
                            city="Karachi"
                            specialisation="Weddings & portraits"
                            startingPrice={145000}
                            nextFreeDate="Free on 14 Dec"
                            onBook={() => setDialogOpen(true)}
                          />
                          <PhotographerCard
                            name="Tariq Aziz"
                            avatarFallback="TA"
                            verified={false}
                            city="Lahore"
                            specialisation="Editorial & street"
                            startingPrice={95000}
                            nextFreeDate="Free on 22 Dec"
                            onBook={() => setDialogOpen(true)}
                          />
                        </div>
                      </div>

                      {/* 5. FormField */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          5. FormField
                        </h3>
                        <div className="space-y-4">
                          <FormField
                            id="field-valid"
                            label="Venue address"
                            helperText="Provide hall name, sector or street."
                            inputProps={{ placeholder: "Clifton, Block 4, Karachi" }}
                          />
                          <FormField
                            id="field-error"
                            label="Wedding date"
                            error="Date cannot be in the past. Select a date at least 7 days ahead."
                            inputProps={{ defaultValue: "12 Oct 2026" }}
                          />
                        </div>
                      </div>

                      {/* 6. EmptyState */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          6. EmptyState
                        </h3>
                        <EmptyState
                          message="No gigs match your filters yet. Widen your city or event type."
                          actionLabel="Clear filters"
                          onAction={() => {}}
                        />
                      </div>

                      {/* 7. SectionHeader */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-midnight border-b border-[#CFCFCB] pb-2">
                          7. SectionHeader
                        </h3>
                        <SectionHeader
                          title="Featured portfolios"
                          lede="Verified wedding photographers available for booking in Karachi."
                          action={<Button variant="secondary" size="sm">Browse all</Button>}
                        />
                      </div>

                    </div>
                  )}

                  {/* DARK SURFACE PATTERNS */}
                  {(tabVal === "both-patterns" || tabVal === "dark-patterns") && (
                    <div
                      data-surface="dark"
                      className="border border-[#26324A] rounded-[2px] p-8 bg-midnight text-chalk space-y-12"
                    >
                      <div className="flex items-center justify-between border-b border-[#26324A] pb-4">
                        <span className="font-sans text-xs uppercase tracking-wider text-[#9AA3B5]">
                          Patterns on Dark Surface
                        </span>
                        <GoldDot />
                      </div>

                      {/* 1. MonthCalendar */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          1. MonthCalendar
                        </h3>
                        <p className="font-sans text-xs text-[#9AA3B5]">
                          Selected date renders solid chalk on dark. Grey indicates booked dates.
                        </p>
                        <MonthCalendar
                          month="December"
                          year={2026}
                          daysCount={31}
                          firstDayOffset={1}
                          bookedDates={[4, 5, 11, 12, 19, 26]}
                          selectedDate={selectedDate}
                          onSelect={setSelectedDate}
                        />
                        <p className="font-sans text-xs text-[#9AA3B5] tabular-nums">
                          Selected date: {selectedDate ? `${selectedDate} December 2026` : "None"}
                        </p>
                      </div>

                      {/* 2. PhotoGrid */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          2. PhotoGrid (Proofing mode)
                        </h3>
                        <p className="font-sans text-xs text-[#9AA3B5]">
                          Low-reflection midnight surface for color appraisal. GoldDot marks client favorites.
                        </p>
                        <PhotoGrid
                          items={samplePhotos}
                          favourites={favourites}
                          onToggle={handleToggleFavourite}
                        />
                      </div>

                      {/* 3. PackageRow */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          3. PackageRow
                        </h3>
                        <div className="space-y-2">
                          <PackageRow
                            name="Mehndi coverage (6 hours)"
                            detail="2 photographers, 300 edited frames, proofing gallery"
                            price={145000}
                            selected={selectedPackage === "mehndi"}
                            onClick={() => setSelectedPackage("mehndi")}
                          />
                          <PackageRow
                            name="Full wedding (3 days)"
                            detail="Mehndi, Baraat, Walima with album and raw archive"
                            price={380000}
                            selected={selectedPackage === "full"}
                            onClick={() => setSelectedPackage("full")}
                          />
                        </div>
                      </div>

                      {/* 4. PhotographerCard */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          4. PhotographerCard
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <PhotographerCard
                            name="Sara Khan"
                            avatarFallback="SK"
                            verified={true}
                            city="Karachi"
                            specialisation="Weddings & portraits"
                            startingPrice={145000}
                            nextFreeDate="Free on 14 Dec"
                            onBook={() => setDialogOpen(true)}
                          />
                          <PhotographerCard
                            name="Tariq Aziz"
                            avatarFallback="TA"
                            verified={false}
                            city="Lahore"
                            specialisation="Editorial & street"
                            startingPrice={95000}
                            nextFreeDate="Free on 22 Dec"
                            onBook={() => setDialogOpen(true)}
                          />
                        </div>
                      </div>

                      {/* 5. FormField */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          5. FormField
                        </h3>
                        <div className="space-y-4">
                          <FormField
                            id="dark-field-valid"
                            label="Venue address"
                            helperText="Provide hall name, sector or street."
                            inputProps={{ placeholder: "Gulberg III, Lahore" }}
                          />
                          <FormField
                            id="dark-field-error"
                            label="Wedding date"
                            error="Date cannot be in the past. Select a date at least 7 days ahead."
                            inputProps={{ defaultValue: "12 Oct 2026" }}
                          />
                        </div>
                      </div>

                      {/* 6. EmptyState */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          6. EmptyState
                        </h3>
                        <EmptyState
                          message="No frames selected yet. Click any frame above to mark as favorite."
                          actionLabel="Reset selection"
                          onAction={() => setFavourites([])}
                        />
                      </div>

                      {/* 7. SectionHeader */}
                      <div className="space-y-4">
                        <h3 className="font-sans text-base font-semibold text-chalk border-b border-[#26324A] pb-2">
                          7. SectionHeader
                        </h3>
                        <SectionHeader
                          title="Proofing selections"
                          lede="Review and approve keeper frames before album binding."
                          action={<Button variant="secondary" size="sm">Export list</Button>}
                        />
                      </div>

                    </div>
                  )}

                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

      </main>

      {/* DIALOG DEMO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirm date request</DialogTitle>
            <DialogDescription>
              Your request will be sent directly to Sara Khan for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border border-border p-3 rounded-[2px] bg-muted/20 space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-surface-secondary">Event</span>
                <span className="font-medium text-foreground">Mehndi, Karachi</span>
              </div>
              <div className="flex justify-between text-xs font-sans">
                <span className="text-surface-secondary">Requested date</span>
                <span className="font-medium text-foreground tabular-nums">14 December 2026</span>
              </div>
              <div className="flex justify-between text-xs font-sans">
                <span className="text-surface-secondary">Estimated deposit</span>
                <span className="font-medium text-foreground tabular-nums">PKR 35,000 (mock)</span>
              </div>
            </div>
            <p className="text-xs text-surface-secondary">
              Free to reschedule up to 14 days before your event. Verification documents checked within 2 working days.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              Send booking request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-[#CFCFCB] px-6 py-12 mt-24">
        <div className="mx-auto max-w-[1120px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="font-sans text-[13px] text-slate">
            Momnt design tokens and brand components. Verified photography platform for Pakistan.
          </p>
        </div>
      </footer>
    </div>
  );
}
