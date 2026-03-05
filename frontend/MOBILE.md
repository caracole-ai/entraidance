# Mobile Optimization Guide

Entraidance is optimized for mobile devices with touch-friendly UI and responsive layouts.

---

## Overview

**Key principles**:
- **Touch-first design** — Buttons ≥44px (11rem = 44px with default font)
- **Single-column layouts** — Stack on mobile, grid on desktop
- **Readable text** — Minimum 16px base font (prevents auto-zoom on iOS)
- **Fast load times** — Lazy loading, code splitting
- **Offline-ready** — PWA support (coming soon)

---

## Responsive Breakpoints

Entraidance uses **Tailwind CSS** default breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `sm` | 640px | Small tablets (portrait) |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Mobile-first approach**: Base styles = mobile, then `sm:`, `md:`, `lg:` for larger screens.

---

## Navigation

### Mobile Menu

**Component**: `MobileNav.tsx`

**Features**:
- Hamburger icon (≥44px touch target)
- Slide-in drawer (Sheet component)
- Full-screen navigation
- Auto-close on link click
- User profile + logout

**Trigger**: Hidden on `md:` and up, replaced by desktop nav.

### Desktop Navigation

**Component**: `Header.tsx`

**Features**:
- Horizontal nav links
- Dropdown menu for profile
- Notification bell
- Sticky header with backdrop blur

---

## Forms

### Touch-Friendly Inputs

**Optimizations**:
- **Button height**: `h-11` (44px) on mobile, `h-10` (40px) on desktop
- **Input height**: `h-11` on mobile (auto on desktop)
- **Touch targets**: Minimum 44x44px (iOS guideline)
- **Font size**: `text-base` (16px) to prevent zoom on iOS

**Example**:
```tsx
<Button className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm">
  Submit
</Button>
```

### Form Layouts

**Mobile**: Single column (`flex-col`)
```tsx
<div className="flex flex-col gap-3">
  <Button className="w-full">Primary</Button>
  <Button className="w-full" variant="outline">Secondary</Button>
</div>
```

**Desktop**: Horizontal (`sm:flex-row`)
```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button>Primary</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

---

## Cards & Grids

### Mission/Offer Cards

**Mobile**: Single column (full width)
```tsx
<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

**Tablet**: 2 columns
**Desktop**: 3 columns

**Card padding**: Responsive `px-4 sm:px-6` (less padding on mobile)

### Search Filters

**Mobile**: Stacked filters (single column)
```tsx
<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <Input />
  <Select />
  <Select />
  <Select />
</div>
```

**Tablet**: 2 columns
**Desktop**: 4 columns

---

## Typography

### Headings

**Mobile**: Smaller (save space)
```tsx
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Title</h1>
```

**Desktop**: Larger for impact

### Body Text

**Base font**: 16px (`text-base`)  
**Reason**: iOS Safari auto-zooms text <16px on focus (bad UX)

**Line height**: 1.5 (Tailwind default) for readability

---

## Spacing

### Page Padding

**Mobile**: Less padding (maximize content)
```tsx
<div className="px-4 py-4 sm:px-6 sm:py-8">
```

**Desktop**: More padding (comfortable margins)

### Component Spacing

**Mobile**: Tighter spacing (`gap-2`, `gap-3`)
```tsx
<div className="space-y-3 sm:space-y-4 lg:space-y-6">
```

**Desktop**: Roomier (`gap-4`, `gap-6`)

---

## Touch Gestures

### Swipe Actions (Future)

**Planned**:
- Swipe to delete (notifications, missions)
- Swipe to refresh (mission list)
- Pull-to-refresh

**Library**: `react-swipeable` or native touch events

### Long Press (Future)

**Planned**:
- Long-press for context menu
- Long-press to preview mission

---

## Performance

### Image Optimization

**Next.js Image**: Automatic lazy loading + responsive sizes
```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={400}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Code Splitting

**Automatic**: Next.js splits routes automatically  
**Manual**: Dynamic imports for heavy components
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

### Lazy Loading

**Lists**: Virtual scrolling for 100+ items (future)  
**Images**: Native `loading="lazy"` + Next.js Image

---

## Accessibility

### Mobile-Specific A11y

**Touch targets**: ≥44x44px (WCAG 2.5.5)
```tsx
<Button size="icon" className="h-11 w-11"> {/* 44x44px */}
  <Icon />
</Button>
```

**Focus indicators**: Visible on keyboard navigation (desktop + mobile keyboard)

**Screen readers**: ARIA labels for icon-only buttons
```tsx
<Button size="icon" aria-label="Menu">
  <Menu />
</Button>
```

---

## Testing

### Mobile Testing Tools

**1. Chrome DevTools Device Mode**
- Cmd+Shift+M (Mac) / Ctrl+Shift+M (Windows)
- Test: iPhone SE, iPhone 14 Pro, Pixel 7, iPad

**2. Real Devices**
- iOS Safari (primary)
- Chrome Android (primary)
- Samsung Internet (secondary)

**3. Responsive Design Checker**
- http://responsivedesignchecker.com/

### Checklist

- [ ] All touch targets ≥44x44px
- [ ] No horizontal scroll on mobile
- [ ] Forms don't auto-zoom (font-size ≥16px)
- [ ] Navigation menu accessible
- [ ] Cards stack properly (single column)
- [ ] Images responsive
- [ ] Text readable (no tiny fonts)
- [ ] Buttons full-width on mobile (where appropriate)

---

## Best Practices

✅ **DO**:
- Use `w-full sm:w-auto` for buttons (full-width mobile, auto desktop)
- Use `flex-col sm:flex-row` for button groups
- Use `grid-cols-1 sm:grid-cols-2` for cards
- Use `px-4 sm:px-6` for consistent padding
- Use `text-base` (16px) for inputs to prevent iOS zoom
- Test on real devices (not just Chrome DevTools)

❌ **DON'T**:
- Use `text-xs` or `text-sm` for inputs (causes auto-zoom on iOS)
- Rely only on hover states (mobile has no hover)
- Use tiny touch targets (<44px)
- Hardcode desktop-only layouts
- Forget to test on real iOS Safari

---

## PWA (Coming Soon)

**Planned features**:
- Manifest.json (add to home screen)
- Service Worker (offline mode)
- Push notifications (WebSocket fallback)
- Splash screens
- App icons (512x512, 192x192)

**See**: `PWA.md` (when implemented)

---

## Browser Support

### Mobile Browsers

**Primary**:
- iOS Safari 14+
- Chrome Android 90+

**Secondary**:
- Samsung Internet 14+
- Firefox Android 90+

**Testing priority**: iOS Safari (most restrictive)

### Known Issues

**iOS Safari**:
- 100vh bug (includes address bar) → Use `dvh` when available
- Input zoom if font-size <16px → Use `text-base`
- No `:focus-visible` on buttons → Polyfill

**Solutions**: Already applied in codebase

---

## Metrics

**Target performance** (mobile):
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3.5s

**Measure**: Lighthouse CI (coming soon in GitHub Actions)

---

## Future Enhancements

- [ ] **Gesture library** (swipe, long-press)
- [ ] **Virtual scrolling** (large lists)
- [ ] **Image placeholders** (blurhash)
- [ ] **Skeleton loaders** (better perceived performance)
- [ ] **Bottom navigation** (mobile-first alternative to top nav)
- [ ] **Haptic feedback** (vibration on actions)

---

## See Also

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
