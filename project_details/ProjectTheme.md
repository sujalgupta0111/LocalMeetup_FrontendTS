# LocalMeetUP — Project Theme Reference

> **Purpose:** Single source of truth for every design token, color, typography rule, spacing convention, and component styling pattern used across the application. Derived from inspecting the actual codebase.

---

## Table of Contents

1. [Theme Architecture](#1-theme-architecture)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Border Radius](#5-border-radius)
6. [Shadows](#6-shadows)
7. [Dark Mode](#7-dark-mode)
8. [Component Styling Conventions](#8-component-styling-conventions)
9. [Transitions & Animations](#9-transitions--animations)
10. [Icon System](#10-icon-system)
11. [CSS Architecture](#11-css-architecture)
12. [Design Language Summary](#12-design-language-summary)

---

## 1. Theme Architecture

### Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| CSS Framework      | **Tailwind CSS v4** (`tailwindcss@^4.3.3`)              |
| Component Library  | **shadcn/ui** (via `@shadcn/react@^0.3.0`)             |
| Primitives         | **Base UI** (`@base-ui/react@^1.7.0`)                  |
| Animations         | `tw-animate-css@^1.4.0`                                |
| Class Merging      | `clsx` + `tailwind-merge` (via `cn()` utility)         |
| Font               | `@fontsource-variable/dm-sans`                         |
| Theme Provider     | Custom React context (`src/providers/theme-provider.jsx`) + Redux `uiSlice` |

### Theme Switching

- **ThemeProvider** (`src/providers/theme-provider.jsx`) toggles between `"light"`, `"dark"`, and `"system"`.
- Applies a `.dark` or `.light` class on `<html>`.
- Persisted via `localStorage` key: `"vite-ui-theme"`.
- Redux `uiSlice` also tracks `theme` state (key: `"theme"`), used for UI state management.

### Custom Variant

```css
@custom-variant dark (&:is(.dark *));
```

This enables Tailwind's `dark:` variant to work with the `.dark` class strategy.

---

## 2. Color System

### CSS Custom Properties (Light Mode — `:root`)

All colors use the **OKLCH** color space.

| Token                        | Value (OKLCH)                     | Usage                               |
| ---------------------------- | --------------------------------- | ----------------------------------- |
| `--background`               | `oklch(1 0 0)`                    | Page background                     |
| `--foreground`               | `oklch(0.145 0 0)`               | Primary text                        |
| `--card`                     | `oklch(1 0 0)`                    | Card surface                        |
| `--card-foreground`          | `oklch(0.145 0 0)`               | Card text                           |
| `--popover`                  | `oklch(1 0 0)`                    | Popover/dropdown background         |
| `--popover-foreground`       | `oklch(0.145 0 0)`               | Popover text                        |
| `--primary`                  | `oklch(0.52 0.105 223.128)`      | Primary brand color (teal-blue)     |
| `--primary-foreground`       | `oklch(0.984 0.019 200.873)`     | Text on primary                     |
| `--secondary`                | `oklch(0.967 0.001 286.375)`     | Secondary surfaces                  |
| `--secondary-foreground`     | `oklch(0.21 0.006 285.885)`      | Text on secondary                   |
| `--muted`                    | `oklch(0.97 0 0)`                | Muted backgrounds                   |
| `--muted-foreground`         | `oklch(0.556 0 0)`               | Muted/placeholder text              |
| `--accent`                   | `oklch(0.52 0.105 223.128)`      | Accent (same as primary)            |
| `--accent-foreground`        | `oklch(0.984 0.019 200.873)`     | Text on accent                      |
| `--destructive`              | `oklch(0.577 0.245 27.325)`      | Error/destructive (red)             |
| `--border`                   | `oklch(0.922 0 0)`               | Border color                        |
| `--input`                    | `oklch(0.922 0 0)`               | Input border                        |
| `--ring`                     | `oklch(0.708 0 0)`               | Focus ring                          |
| `--radius`                   | `0.875rem` (14px)                 | Base border radius                  |

#### Sidebar-Specific Tokens (Light)

| Token                          | Value                             |
| ------------------------------ | --------------------------------- |
| `--sidebar`                    | `oklch(0.985 0 0)`               |
| `--sidebar-foreground`         | `oklch(0.145 0 0)`               |
| `--sidebar-primary`            | `oklch(0.609 0.126 221.723)`     |
| `--sidebar-primary-foreground` | `oklch(0.984 0.019 200.873)`     |
| `--sidebar-accent`             | `oklch(0.97 0 0)`                |
| `--sidebar-accent-foreground`  | `oklch(0.205 0 0)`               |
| `--sidebar-border`             | `oklch(0.922 0 0)`               |
| `--sidebar-ring`               | `oklch(0.708 0 0)`               |

#### Chart Colors

| Token        | Value                             |
| ------------ | --------------------------------- |
| `--chart-1`  | `oklch(0.809 0.105 251.813)`     |
| `--chart-2`  | `oklch(0.623 0.214 259.815)`     |
| `--chart-3`  | `oklch(0.546 0.245 262.881)`     |
| `--chart-4`  | `oklch(0.488 0.243 264.376)`     |
| `--chart-5`  | `oklch(0.424 0.199 265.638)`     |

### Inline Brand Colors (Tailwind Classes)

These Tailwind colors are used directly in components and define the **visual brand identity**:

| Purpose              | Tailwind Classes                                             |
| -------------------- | ------------------------------------------------------------ |
| **Primary Gradient** | `bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500` |
| **Button Gradient**  | `bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600` |
| **Button Shadow**    | `shadow-lg shadow-violet-500/25`                             |
| **Focus Ring**       | `focus:ring-violet-500/10`, `focus:border-violet-500`        |
| **Link Color**       | `text-violet-600`, `hover:text-violet-700`                   |
| **Active Nav State** | `bg-violet-50 text-violet-700` (light), `dark:bg-violet-500/10 dark:text-violet-300` (dark) |
| **Background Glows** | `bg-violet-300/30`, `bg-cyan-300/30`, `bg-fuchsia-200/20`   |
| **Neutral Text**     | `text-slate-900`, `text-slate-500`, `text-slate-400`         |
| **Neutral Borders**  | `border-slate-200`, `border-white/50`                        |
| **Card Surface**     | `bg-white/85 backdrop-blur-xl`                               |
| **Progress Bar**     | `bg-violet-600` (filled), `bg-slate-200` (unfilled)          |

### Root-Level CSS Colors (Non-Token)

Set directly on `:root`:

```css
:root {
  color: #0f172a;       /* slate-900 */
  background: #f8fafc;  /* slate-50 */
}
```

---

## 3. Typography

### Font Family

```css
@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: 'DM Sans Variable', sans-serif;
}
```

**Fallback stack** in `:root`:

```
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### Typography Scale Used in Components

| Element / Context        | Classes                                                   |
| ------------------------ | --------------------------------------------------------- |
| Page headings            | `text-3xl font-bold tracking-tight text-slate-900`        |
| Sub-headings             | `text-2xl font-bold tracking-tight`                       |
| Body / descriptions      | `text-sm leading-6 text-slate-500`                        |
| Input labels             | `text-sm font-medium text-gray-700`                       |
| Button text              | `font-semibold text-white`                                |
| Small UI labels          | `text-xs font-medium text-slate-600`                      |
| Footer text              | `text-sm text-muted-foreground`                           |
| Step indicator           | `text-sm font-medium text-slate-400`                      |
| Navigation links (bold)  | `text-sm font-semibold text-violet-600`                   |
| Error messages           | `text-sm font-medium text-red-600`                        |
| Success messages         | `text-sm font-medium text-emerald-600`                    |

### Font Rendering

```css
font-synthesis: none;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 4. Spacing & Layout

### Container Strategy

| Context          | Max Width     | Padding                               |
| ---------------- | ------------- | ------------------------------------- |
| Auth pages       | `max-w-md`    | `px-4 py-8 sm:px-6`                  |
| Registration     | `max-w-xl`    | `p-6 sm:p-9`                         |
| Dashboard layout | `max-w-7xl`   | `px-4 sm:px-6 lg:px-8`               |
| Old page-shell   | `1120px`      | `padding: 2rem 0 3rem`               |

### Common Spacing Patterns

| Pattern               | Classes                     |
| --------------------- | --------------------------- |
| Card inner padding    | `p-6 sm:p-9`               |
| Form field spacing    | `space-y-5`                 |
| Section margin-bottom | `mb-7`, `mb-8`              |
| Header height         | `h-16` (64px)               |
| Nav bar height        | `h-12` (48px)               |
| Button min-heights    | `min-h-8` (sm), `min-h-10` (md), `min-h-12` (lg) |

---

## 5. Border Radius

### Token-Based Radius Scale

```css
--radius: 0.875rem;            /* 14px — base */
--radius-sm: calc(0.875 * 0.6);   /* ~8.4px */
--radius-md: calc(0.875 * 0.8);   /* ~11.2px */
--radius-lg: 0.875rem;            /* 14px */
--radius-xl: calc(0.875 * 1.4);   /* ~19.6px */
--radius-2xl: calc(0.875 * 1.8);  /* ~25.2px */
--radius-3xl: calc(0.875 * 2.2);  /* ~30.8px */
--radius-4xl: calc(0.875 * 2.6);  /* ~36.4px */
```

### Radius in Practice

| Component         | Class              |
| ----------------- | ------------------ |
| Cards / Modals    | `rounded-3xl`      |
| Input fields      | `rounded-xl`       |
| Buttons (default) | `rounded-lg`       |
| Buttons (icon)    | `rounded-full`     |
| Alert boxes       | `rounded-xl`       |
| Avatars           | `rounded-full`     |
| Logo badge        | `rounded-2xl`      |
| Brand pill header | `rounded-xl`       |
| Dropdown items    | `rounded-md`       |

---

## 6. Shadows

| Component              | Shadow Classes                                                |
| ---------------------- | ------------------------------------------------------------- |
| Login card             | `shadow-[0_25px_80px_-25px_rgba(79,70,80,0.3)]`             |
| Registration card      | `shadow-xl`                                                   |
| Brand logo (auth)      | `shadow-xl shadow-violet-500/25`                              |
| Brand logo (header)    | `shadow-md shadow-violet-500/20`                              |
| CTA button             | `shadow-lg shadow-violet-500/25` → `hover:shadow-xl hover:shadow-violet-500/30` |
| OAuth buttons          | `shadow-sm` → `hover:shadow-md`                              |
| Popover / Dropdown     | `shadow-md` (via shadcn)                                     |
| Active nav item        | `shadow-sm shadow-violet-500/5`                               |
| Old sidebar            | `shadow-xl`                                                   |

### Glassmorphism Pattern

Used on auth cards and layout header:

```
bg-white/85 backdrop-blur-xl           /* Auth cards */
bg-background/80 backdrop-blur-xl      /* Header */
bg-background/90 backdrop-blur-lg      /* Nav bar */
```

---

## 7. Dark Mode

### Dark Mode Token Overrides (`.dark` class)

| Token                        | Dark Value                         |
| ---------------------------- | ---------------------------------- |
| `--background`               | `oklch(0.145 0 0)`               |
| `--foreground`               | `oklch(0.985 0 0)`               |
| `--card`                     | `oklch(0.205 0 0)`               |
| `--card-foreground`          | `oklch(0.985 0 0)`               |
| `--popover`                  | `oklch(0.205 0 0)`               |
| `--popover-foreground`       | `oklch(0.985 0 0)`               |
| `--primary`                  | `oklch(0.45 0.085 224.283)`      |
| `--secondary`                | `oklch(0.274 0.006 286.033)`     |
| `--secondary-foreground`     | `oklch(0.985 0 0)`               |
| `--muted`                    | `oklch(0.269 0 0)`               |
| `--muted-foreground`         | `oklch(0.708 0 0)`               |
| `--accent`                   | `oklch(0.45 0.085 224.283)`      |
| `--destructive`              | `oklch(0.704 0.191 22.216)`      |
| `--border`                   | `oklch(1 0 0 / 10%)`            |
| `--input`                    | `oklch(1 0 0 / 15%)`            |
| `--ring`                     | `oklch(0.556 0 0)`               |

### Dark Mode Inline Overrides

For components that use Tailwind colors directly (not CSS tokens):

| Component          | Light                            | Dark Override                                       |
| ------------------ | -------------------------------- | --------------------------------------------------- |
| Active nav item    | `bg-violet-50 text-violet-700`   | `dark:bg-violet-500/10 dark:text-violet-300`        |
| Location active    | `bg-violet-50 text-violet-700`   | `dark:bg-violet-500/10 dark:text-violet-400`        |
| Avatar fallback    | `from-violet-100 to-indigo-100`  | `dark:from-violet-900/40 dark:to-indigo-900/40`     |

---

## 8. Component Styling Conventions

### Button Variants (`src/components/mycomponents/ui/Button.jsx`)

| Variant     | Classes                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `primary`   | `bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800`         |
| `secondary` | `bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300`      |
| `outline`   | `border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100` |
| `danger`    | `bg-red-600 text-white hover:bg-red-700 active:bg-red-800`            |
| `ghost`     | `bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200`   |

> **Note:** The CTA "Sign in" button on the login page **overrides** the base variant with a violet gradient via `className` prop.

### Input Styling Pattern

Base input class (from `Input.jsx`):
```
w-full rounded-lg border py-2 outline-none transition
```

Auth-page override (applied via `className`):
```
rounded-xl border-slate-200 bg-slate-50/50 text-slate-900
placeholder:text-slate-400 transition-all duration-200
focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10
```

### Card / Modal Pattern

```
rounded-3xl border border-white/50 bg-white/85
p-6 shadow-xl backdrop-blur-xl sm:p-9
```

### Alert Pattern

**Error:**
```
rounded-xl border border-red-100 bg-red-50 px-4 py-3
text-sm font-medium text-red-600
```

**Success:**
```
rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3
text-sm font-medium text-emerald-600
```

### OAuth Button Pattern

```
border-slate-200 bg-white shadow-sm
transition-all duration-200
hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md
```

---

## 9. Transitions & Animations

### Standard Transitions

| Purpose               | Classes                                      |
| --------------------- | -------------------------------------------- |
| Color changes         | `transition-colors duration-200`             |
| All properties        | `transition-all duration-200`                |
| Transform + shadow    | `transition-all duration-200`                |
| Button shine          | `transition-all duration-700`                |
| Nav hover expansion   | `transition-all duration-200 ease-out`       |
| Sidebar (old expand)  | `transition-all duration-300`                |

### Motion Considerations

```
motion-reduce:transition-none     /* on Button component */
motion-reduce:hover:px-3          /* on nav items */
motion-safe:animate-[...]         /* on registration step transitions */
```

### Hover Effects

| Component       | Effect                                                |
| --------------- | ----------------------------------------------------- |
| CTA buttons     | `hover:-translate-y-0.5 hover:shadow-xl`             |
| OAuth buttons   | `hover:-translate-y-0.5 hover:shadow-md`             |
| Nav items       | `hover:px-4` (padding expansion, smooth)              |
| Avatar trigger  | `hover:ring-2 hover:ring-violet-500/20`              |
| Location btn    | `hover:bg-accent/10 hover:text-foreground`           |

### Animations

- **Button shine:** Absolute white overlay sweeps from left to right on hover (`group-hover:left-full`)
- **Step transition:** `motion-safe:animate-[account-step-in_220ms_ease-out]`
- **Dropdown / Popover enter:** `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95`
- **Dropdown / Popover exit:** `data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`

---

## 10. Icon System

### Library

**Lucide React** (`lucide-react@^1.28.0`)

### Icon Sizing

| Context           | Size                                |
| ----------------- | ----------------------------------- |
| Button sm icons   | `[&>svg]:size-4`                    |
| Button md icons   | `[&>svg]:size-5`                    |
| Sidebar old icons | `size={24}`                         |
| Nav icons         | `size={18}`                         |
| Header icons      | `size={14}` – `size={16}`          |
| Dropdown icons    | `size={16}`                         |
| Input icons       | `size={20}`                         |

### Custom Icons

- `src/components/icons/BrandLogo.jsx` — Gradient-filled div with text (not an SVG icon)
- `src/components/icons/OuthIcon.jsx` — Custom SVG icons for Google, GitHub, Facebook, Discord

---

## 11. CSS Architecture

### File Structure

| File               | Purpose                                                   |
| ------------------ | --------------------------------------------------------- |
| `src/index.css`    | Tailwind imports, CSS custom properties, base layer rules |
| `src/App.css`      | Legacy page layout classes (`.site-header`, `.hero-section`, `.feature-card`, etc.) |

### Tailwind Imports (`index.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/dm-sans";
```

### Base Layer Rules

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
  html {
    @apply font-sans;
  }
}
```

### Utility Function

`src/lib/utils.js` exports `cn()`:
```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 12. Design Language Summary

| Aspect                | Convention                                                            |
| --------------------- | --------------------------------------------------------------------- |
| **Brand identity**    | Violet → Indigo → Cyan gradient                                      |
| **Visual style**      | Glassmorphism, frosted glass cards, backdrop blur                     |
| **Color palette**     | Violet-600 primary, Slate neutrals, Cyan-500 accent                  |
| **Dark mode**         | Full support via `.dark` class + OKLCH token overrides                |
| **Border radius**     | Large radii — `rounded-3xl` cards, `rounded-xl` inputs, `rounded-lg` buttons |
| **Shadows**           | Colored shadows (`shadow-violet-500/25`), depth via blur             |
| **Hover effects**     | Subtle translate-Y lifts, shadow amplification, padding growth       |
| **Typography**        | DM Sans Variable, tight tracking, semibold headings                  |
| **Focus states**      | Violet rings (`ring-violet-500/10`), offset-2                        |
| **Animations**        | Entrance fades + zooms, button shine sweep, step slide-in            |
| **Accessibility**     | `motion-reduce` variants, `aria-label` on icon buttons, focus-visible rings |
| **State management**  | shadcn token system (CSS vars) + inline Tailwind overrides           |

---

*Last updated: 2026-09-27*
