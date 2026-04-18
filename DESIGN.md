# Design Brief

## Concept
Premium mobile banking platform for Bawjiase Community Bank PLC with tech-forward aesthetic and glassmorphic depth.

## Tone & Differentiation
Sharp, professional, trustworthy. Rare use of vibrant emerald-green as primary (vs. traditional navy) signals innovation and growth. Glassmorphism and neon glow effects create futuristic banking experience.

## Color Palette

| Role | OKLCH | Usage |
|------|-------|-------|
| Primary (Emerald) | `0.58 0.19 142` | Primary CTAs, active states, brand accent |
| Secondary (Teal) | `0.70 0.10 185` | Interactive elements, secondary buttons |
| Background | `0.10 0 0` | Page background, deep charcoal/near-black |
| Card | `0.16 0 0` | Glassmorphic cards with semi-transparent overlay |
| Foreground | `0.96 0 0` | Text, primary foreground on dark |
| Destructive | `0.65 0.19 22` | Alerts, errors, negative actions |
| Border | `0.22 0 0` | Subtle dividers, card edges |

## Typography
- **Display**: General Sans (geometric, modern, distinctive headings)
- **Body**: DM Sans (crisp, legible, professional body copy)
- **Mono**: Geist Mono (technical/transactional data)
- **Scale**: 12/14/16/18/24/32/40px with tight tracking on headings

## Elevation & Depth
- `.glass`: Base glassmorphism (backdrop blur 8px, bg opacity 0.85, white border 0.05)
- `.glass-dark`: Enhanced glass effect for modals (backdrop blur 12px, bg opacity 0.75, white border 0.08)
- Shadows: `shadow-elevated` (0 8px 24px -4px rgba(0,0,0,0.15)) for cards
- Inset highlight: Subtle inset border for glass depth

## Structural Zones

| Zone | Background | Border | Treatment |
|------|-----------|--------|-----------|
| Header | card bg with glass | border-b subtle | Fixed/sticky, elevated shadow |
| Content | background (0.10) | none | Full-bleed background |
| Cards | card with glass | border-border | Glassmorphic with shadow-card-glass |
| Input/Form | card glass | border-input | Subtle glass treatment, focus ring emerald |
| Footer | card (0.16) | border-t subtle | Sticky mobile, elevated on desktop |

## Component Patterns
- **Buttons**: Primary emerald with glow-emerald shadow on hover, smooth scale transition. Secondary teal.
- **Cards**: Glass effect with rounded-lg, shadow-card-glass, fade-in animation on load
- **Transaction List**: Stacked cards with slide-up stagger animation, tap-to-expand detail
- **Input Fields**: Glass treatment with focus ring in primary color
- **Active States**: Neon green glow (box-shadow), text highlight with accent color

## Motion
- **Default**: `transition-smooth` (0.3s cubic-bezier(0.4, 0, 0.2, 1))
- **Load**: `animate-fade-in` or `animate-scale-in` (0.25s cubic-bezier(0.34, 1.56, 0.64, 1))
- **Stagger**: 50ms between card/list items
- **Hover**: Scale 1.02 + glow-emerald shadow on interactive elements

## Responsive Design
- **Mobile-first** (sm: 640px, md: 768px, lg: 1024px)
- **Mobile**: Stacked cards, full-width inputs, bottom navigation bar, compact header
- **Desktop**: Dashboard grid, sidebar navigation, horizontal spacing balance, floating action buttons

## Anti-Patterns to Avoid
- Do NOT use default Tailwind colors or grey neutrals
- Do NOT mix OKLCH values in hex or rgb functions
- Do NOT apply uniform rounded corners or spacing
- Do NOT animate every element; focus on deliberate, purposeful motion
- Do NOT use glassmorphism on text (text must remain crisp on opaque background)

## Signature Detail
Emerald neon glow (`glow-emerald` utility) applied to primary actions and success states — when a user taps a button or completes a transaction, a soft emerald glow pulses briefly before fading. This creates a distinctive, premium micro-interaction that signals confidence and modern tech aesthetic.
