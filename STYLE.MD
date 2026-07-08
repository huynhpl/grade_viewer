# STYLE.MD — React + Vite + shadcn/ui + Tailwind

---

## 01 · Project Identity

App type: Internal academic web app — students look up exam results; instructors
manage grades (manual entry, Excel import, edit, statistics).
Audience: University students (mobile + desktop) and instructors (desktop).
Brand voice: Calm, precise, institutional — trustworthy, not flashy.
Emotional goal: "confident and in control" — clarity over decoration.

---

## 02 · Tech Stack

Framework:   React 18 + Vite 5 (SPA), routing via react-router-dom v6
Styling:     Tailwind CSS v3 — utility-first, NO ad-hoc inline styles
Components:  shadcn/ui — hand-vendored source in src/components/ui/*
Icons:       lucide-react — import named exports, size via `className="size-4"`
Fonts:       @fontsource-variable — Outfit (sans), JetBrains Mono (mono/tabular),
             imported once in src/main.tsx
Utils:       cn() from @/lib/utils for conditional class merging (clsx + tailwind-merge)
Alias:       `@/` → `src/` (configured in vite.config.ts + tsconfig paths)

> There is NO Next.js here. Do not use next/font, next/image, next/link, Server
> Components, or the App Router. Use plain <img>, react-router <Link>/<NavLink>,
> and standard React client components.

---

## 03 · Design Tokens (Tailwind + CSS vars)

CSS variables defined in src/index.css as HSL triplets, light + `.dark`:
  --background       --foreground
  --card             --card-foreground
  --popover          --popover-foreground
  --primary          --primary-foreground   (single desaturated indigo accent)
  --secondary        --secondary-foreground
  --muted            --muted-foreground
  --accent           --accent-foreground
  --destructive      --destructive-foreground
  --success          --success-foreground
  --warning          --warning-foreground
  --border  --input  --ring  --shadow  --radius

Use Tailwind semantic classes: bg-background, text-foreground,
text-muted-foreground, border-border, bg-card, bg-primary, bg-success, etc.
NEVER use raw hex values or Tailwind palette colors (bg-gray-500, text-blue-600).

Colour discipline (calm academic):
- ONE accent (--primary). Do not introduce a second brand hue.
- Semantic status only: --success (Đủ điều kiện / đạt), --destructive (Cấm thi /
  trượt), --warning (sparingly). No decorative rainbow gradients.
- Data figures use `.tabular` (font-variant-numeric: tabular-nums).

---

## 04 · Component Rules

ALWAYS use the vendored shadcn/ui components — NEVER rebuild from raw HTML:

  Button      → @/components/ui/button
              variants: default | secondary | ghost | outline | destructive | link
  Input       → @/components/ui/input
  Label       → @/components/ui/label   (pair htmlFor with every field)
  Card        → @/components/ui/card    (Card, CardHeader, CardTitle, CardContent…)
  Dialog      → @/components/ui/dialog  (forms, detail modals)
  AlertDialog → @/components/ui/alert-dialog  (destructive confirmations)
  Select      → @/components/ui/select  (Radix — Item value CANNOT be ""; use a
              sentinel like "all")
  Badge       → @/components/ui/badge   (default|secondary|outline|success|destructive|warning)
  Table       → @/components/ui/table
  DropdownMenu → @/components/ui/dropdown-menu
  Separator   → @/components/ui/separator
  Skeleton    → @/components/ui/skeleton  (loading states)
  Alert       → @/components/ui/alert     (inline errors — NOT alert()/confirm())

Theme: ModeToggle (@/components/ModeToggle) + ThemeProvider/useTheme
(@/components/theme-provider). Class-based dark mode.

To add a new shadcn component, vendor its source into src/components/ui/ and wire
it to the tokens above (match the existing files' conventions).

---

## 05 · Layout & Responsive

Container:    mx-auto max-w-6xl (admin) / max-w-3xl (student) px-4 sm:px-6
Grid:         CSS Grid via Tailwind — grid, grid-cols-*, gap-*
Full-screen:  min-h-dvh (NEVER 100vh — iOS Safari viewport bug)
Mobile-first: base = mobile, add sm: md: lg: xl: prefixes
Breakpoints:  sm=640 md=768 lg=1024 xl=1280 2xl=1400

Page structure:
  src/
    main.tsx        → router, providers, font + css imports
    pages/          → one component per route
    components/     → shared components
    components/ui/  → shadcn primitives
    hooks/  services/  lib/

---

## 06 · ALWAYS / NEVER

ALWAYS:
- Use cn() for conditional classes: cn("base", condition && "extra")
- Handle loading with <Skeleton>; handle empty states explicitly (never a blank box)
- Use react-router <Link>/<NavLink> for navigation; style the active NavLink
- Give every interactive element hover + focus-visible + active feedback
- Provide descriptive alt on meaningful <img>; aria-label on icon-only buttons

NEVER:
- Write inline style={{}} except for genuinely dynamic computed values (e.g. a
  chart colour resolved from a CSS var, a computed width)
- Hardcode colors — always semantic token classes
- Use Tailwind palette directly (bg-gray-200) or arbitrary values ([#fff]) when a
  token exists
- Use alert()/confirm()/prompt() — use Dialog / AlertDialog / Alert
- Use emoji as UI icons — use lucide-react
- Ship "Lorem ipsum", "TODO", or placeholder copy
- Reintroduce Next.js APIs (next/*) — this is a Vite SPA

---

## 07 · Accessibility

Target:       WCAG 2.1 AA
Contrast:     4.5:1 text, 3:1 UI components and large text (verify in both themes)
Keyboard:     all interactive elements reachable/operable via Tab/Enter/Space/Escape
Focus:        focus-visible: ring variants (already in the ui primitives) — never
              remove the focus outline (no `outline: none` without a replacement)
Semantics:    <button> for actions, <a>/<Link> for navigation, <h1-h6> in order,
              <nav>/<main>/<header> landmarks
Forms:        <Label htmlFor> paired with every Input/Select
Language:     UI is Vietnamese; keep UTF-8 diacritics intact (fonts ship the
              Vietnamese subset)

---

## 08 · Motion & Dark Mode

Transitions:
- State changes: transition-colors duration-200 (already on ui primitives)
- Mount/unmount: Radix data-state + tailwindcss-animate (fade/zoom)
- Prefer transform/opacity; ALWAYS add `motion-reduce:transition-none` (and
  respect prefers-reduced-motion for scroll/animation)

Dark mode:
- Strategy: class-based (`.dark` on <html>)
- Provider: ThemeProvider persists to localStorage ('rt-theme'); supports
  light | dark | system; ModeToggle switches it
- Never hardcode light/dark values — semantic tokens flip automatically
- Test every component in BOTH themes before marking done
