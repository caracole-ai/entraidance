# Design Brief — Entraidance Glassmorphism Redesign

## Source Stitch HTML (reference)
See `/tmp/stitch-besoins-source.html` for the full Stitch HTML.

## Design System to implement

### Color Palette
- Primary: `#9333ea` (purple-600)
- Background: gradient `from-[#fdfcfb] to-[#e2d1c3]`
- Card backgrounds: `bg-white/40` with `backdrop-blur-md`
- Borders: `border-white/40` or `border-white/60`
- Accent colors per category (indigo, green, orange, pink, yellow, cyan)

### Typography
- Font: "Public Sans" (already similar to current), weight 300-900
- Titles: `font-black` (900), `tracking-tight`/`tracking-tighter`
- Labels/filters: `uppercase tracking-widest text-xs font-black`
- Body: `font-medium`

### Effects
- Glassmorphism: `bg-white/40 backdrop-blur-md` on cards
- Shadows: `shadow-xl`, `shadow-[0_32px_64px_-16px_rgba(147,51,234,0.25)]`
- Hover: `hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`
- Rounded corners: `rounded-[2.5rem]` to `rounded-[3.5rem]` (very large)
- Blobs: Large blurred colored divs for background ambiance
- Float animation on hero accent text

### Layout Changes (missions/page.tsx)
- Hero section at top with glassmorphism container
- Sidebar filters on the left (desktop), full-width on mobile
- 3-column card grid on desktop
- Cards with large rounded corners, floating category icon (top-right), urgency badge (top-left)

### Card Design
- `rounded-[3rem]` corners
- Padding `p-8`, extra top padding `pt-12` for floating elements
- Category icon: absolute positioned `-top-6 -right-4`, in a `w-24 h-24 rounded-[2.5rem]` container
- Urgency badge: absolute `-top-3 -left-3` with pill shape
- Content: category label (colored, uppercase), title (bold), location + date info, divider, author + CTA

### Header Changes
- Larger height `h-20`
- Material icon for logo
- Uppercase nav links with `tracking-wider`
- Rounded buttons `rounded-xl`
- Glassmorphism: `bg-white/80 backdrop-blur-md`

### Footer Changes  
- 4-column grid layout
- Navigation, Legal, Contact sections
- Clean divider with copyright
