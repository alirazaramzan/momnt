import React from "react";
import {
  Logo,
  Seal,
  VerifiedBadge,
  CropMarks,
  CameraCaption,
  GoldDot,
  PhotoPlaceholder,
} from "@/components/brand";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Design System — Momnt",
  description: "Brand tokens, components, and surface rules for Momnt.",
};

export default function DesignSystemPage() {
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

  return (
    <div className="min-h-screen bg-chalk text-midnight">
      {/* Top Header */}
      <header className="border-b border-[#CFCFCB] px-6 py-6">
        <div className="mx-auto max-w-[1120px] flex items-center justify-between">
          <Logo size="md" />
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

        {/* SECTION 2: Surfaces comparison (Light vs Dark) */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-[32px] leading-tight text-midnight">
              Surfaces
            </h2>
            <p className="mt-2 font-sans text-[16px] leading-[26px] text-slate max-w-2xl">
              Light surface is chalk background with midnight text. Dark surface is midnight background with chalk text. Applied with data-surface=&quot;dark&quot;.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LIGHT SURFACE PREVIEW */}
            <div
              data-surface="light"
              className="border border-[#CFCFCB] rounded-[2px] p-8 bg-chalk text-midnight space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#CFCFCB] pb-4">
                <span className="font-sans text-[13px] uppercase tracking-wider text-slate">
                  Light surface
                </span>
                <GoldDot />
              </div>

              <div className="space-y-4">
                <Logo variant="light" size="lg" />
                <p className="font-sans text-[16px] leading-[26px] text-midnight">
                  Momnt connects verified photographers with clients across Pakistan.
                </p>
                <CameraCaption number="014" event="Mehndi" aperture="f/1.8" />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#CFCFCB]">
                <Button variant="default">Book this date</Button>
                <Button variant="outline">View portfolio</Button>
                <VerifiedBadge />
              </div>
            </div>

            {/* DARK SURFACE PREVIEW */}
            <div
              data-surface="dark"
              className="border border-[#26324A] rounded-[2px] p-8 bg-midnight text-chalk space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#26324A] pb-4">
                <span className="font-sans text-[13px] uppercase tracking-wider text-[#9AA3B5]">
                  Dark surface (data-surface=&quot;dark&quot;)
                </span>
                <GoldDot />
              </div>

              <div className="space-y-4">
                <Logo variant="dark" size="lg" />
                <p className="font-sans text-[16px] leading-[26px] text-chalk">
                  Proofing gallery, shot list, Academy, and auth brand panel live on dark surfaces.
                </p>
                <CameraCaption
                  number="082"
                  event="Baraat"
                  aperture="f/2.0"
                  className="text-[#9AA3B5]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#26324A]">
                <Button variant="default">Approve shots</Button>
                <Button variant="outline">Download proof</Button>
                <VerifiedBadge />
              </div>
            </div>

          </div>
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
                <span className="font-sans text-[13px] text-slate">Standard wordmark</span>
                <Logo size="lg" />
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

      </main>

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
