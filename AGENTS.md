# Momnt: standing rules

## Product
Momnt is a verified photography platform for Pakistan (web). Portals: public, client or agency, photographer or mentor, vendor or location owner, admin. English only. Payments are mock only.

## Stack
Next.js App Router, TypeScript, Tailwind, shadcn/ui, lucide-react. Screens are presentational. They take props and read from /lib/mock. No database calls yet.

## Brand tokens (the only colours allowed)
midnight #0A1428, chalk #F1F0EC, brass #C2A267, mist #E3E5E8, slate #5B6578, verified #1E7A5C, alert #B4423A.
Dark-surface secondary text: #9AA3B5. Dark-surface hairline: #26324A. Light hairline: #CFCFCB.
Brass is for hairlines, crop marks, the gold dot and active-tab underlines only. Never brass text on chalk (contrast 2.1:1). Never a brass button.
Verified green only for verified, paid, delivered states. Alert red only for errors and rejected.
No other colours. No gradients anywhere except the photo placeholder component.

## Surfaces
Light surface: chalk background, midnight text. Dark surface: midnight background, chalk text.
Dark surfaces: proofing gallery, shot list, Academy, auth brand panel. Everything else is light.
Implement with a data-surface="dark" wrapper, not with OS dark mode.

## Typography
Display: Bodoni Moda, only at 32px and above, sentence case. Italic for a whole phrase, never one decorative word.
Everything else: Manrope. Body 16/26. Caption 13/18 in slate. Title 22/30 semibold.
Prices, dates, names: Manrope with tabular numbers.
No all-caps labels. No letter-spaced uppercase.

## Shape and layout
Radius 2px on cards, inputs, buttons. Chips and avatars fully round. 1px hairline borders. No drop shadows (one soft shadow allowed on menus and dialogs only).
Spacing in multiples of 8. Public pages max width 1120px, portals 1280px, page margin 24px.
Primary button: solid midnight on light, solid chalk on dark. Secondary: 1px outline. One primary button per screen section.

## Decoration rules
Six brand elements only: crop marks, camera caption (for example "No. 014, Mehndi, f/1.8"), brass hairline, verified seal, gold dot, contact strip.
Maximum two decorative elements per screen section. Empty space is part of the design.
Never: camera icon clichés, stock-smile imagery, emoji, glitter, floral frames, heavy gold, icon-in-a-circle feature grids, gradient blobs.
Icons: lucide-react, stroke 1.5, used sparingly and never decoratively.

## Imagery
Never hotlink stock photos. Use the PhotoPlaceholder component (gradient plus camera caption) until real images exist.
Never tint, filter or overlay photographs. Never put a Momnt watermark on a photographer's image. Always credit the photographer beside their work.

## Logo
Use the Logo components in /components/brand only. Wordmark is lowercase "momnt" in Bodoni Moda with a brass full stop. Seal is the focus mark (four crop corners around a gold dot). Never stretch, tilt, outline or recolour. Minimum wordmark width 72px.

## Voice
Warm, exact, short sentences. Sentence case everywhere. Buttons name the action ("Book this date"). No exclamation marks. Never write: "special moments", "stunning", "your big day", "seamless", "world-class".

## Accessibility
Text contrast at least 4.5:1. Visible keyboard focus (2px midnight or chalk outline with 2px offset). Alt text on every image. Tap targets at least 44px on mobile. Respect prefers-reduced-motion. Motion is 200ms ease, fade plus 8px rise, nothing bouncy.

## States
Every data screen has designed loading (skeleton in mist), empty (one line telling the person what to do next) and error (what went wrong and how to fix it) states.

## Process
Never redesign a screen unless asked. Never add features, copy or colours that were not requested. Reuse /components/ui and /components/patterns before creating anything new. After building, open the page in the browser, screenshot at 1440px and 390px wide, fix visible problems, then report against the acceptance checklist. If something in a prompt conflicts with these rules, stop and ask.
