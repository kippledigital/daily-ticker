---
title: Pro Features Teaser - Visual Specifications
description: Detailed styling, spacing, and responsive specifications
feature: Pro Features Teaser
last-updated: 2025-11-11
version: 2.0.0
status: implemented
---

# Visual Specifications: Pro Features Teaser

## Section Container

### Layout Structure

```
<section className="mb-12">
  <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border border-[#00ff88]/20 rounded-xl p-8 md:p-10">
    {/* Content */}
  </div>
</section>
```

### Container Specifications

**Background**
- Gradient: `bg-gradient-to-br` (top-left to bottom-right)
- Start color: `#1a3a52` (Medium blue-gray)
- End color: `#0B1E32` (Dark navy - base background)
- Effect: Creates subtle depth without distracting from content

**Border**
- Width: `1px` (default)
- Color: `#00ff88` with 20% opacity
- Style: Solid
- Purpose: Subtle green accent maintains brand consistency

**Border Radius**
- Size: `12px` (rounded-xl)
- Corners: All corners equal
- Effect: Softer appearance, modern aesthetic

**Padding**
- Desktop (≥768px): `40px` (p-10)
- Mobile (<768px): `32px` (p-8)
- Purpose: Provides breathing room around content

**Positioning**
- Position: `relative`
- Overflow: `hidden`
- Purpose: Contains absolutely positioned background decoration

### Background Decoration

```
<div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl -z-10" />
```

**Specifications**
- Size: `384px × 384px` (w-96 h-96)
- Position: Top-right corner
- Color: `#00ff88` with 5% opacity
- Shape: Circle (rounded-full)
- Blur: `24px` (blur-3xl)
- Z-index: `-10` (behind all content)
- Effect: Subtle green glow in top-right adds visual interest

## Header Section

### PRO FEATURES Badge

```
<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00ff88]/20 border border-[#00ff88]/40 rounded-full text-xs font-bold text-[#00ff88] mb-4">
  <Target className="w-3.5 h-3.5" />
  PRO FEATURES
</div>
```

**Layout**
- Display: `inline-flex` (shrink-wraps content)
- Alignment: `items-center` (vertical center)
- Gap: `8px` (gap-2) between icon and text
- Margin: `16px` bottom (mb-4)

**Badge Styling**
- Padding: `16px horizontal × 6px vertical` (px-4 py-1.5)
- Background: `#00ff88` at 20% opacity
- Border: `1px solid #00ff88` at 40% opacity
- Border radius: `9999px` (rounded-full, full circle)
- Shadow: None

**Typography**
- Font size: `12px` (text-xs)
- Font weight: `700` (font-bold)
- Color: `#00ff88` (full brightness green)
- Text transform: Uppercase (manual in content)
- Letter spacing: Normal

**Icon**
- Component: `Target` from lucide-react
- Size: `14px × 14px` (w-3.5 h-3.5)
- Color: Inherits text color (`#00ff88`)
- Stroke width: Default (2px)

### Main Headline

```
<h3 className="text-3xl font-bold text-white mb-2">
  See What You're Missing
</h3>
```

**Typography**
- Font size: `30px` (text-3xl)
- Line height: `36px` (1.2 ratio)
- Font weight: `700` (font-bold)
- Color: `#FFFFFF` (white)
- Margin: `8px` bottom (mb-2)

**Responsive Scaling**
- Desktop: `30px`
- Tablet: `30px`
- Mobile: Could scale to `28px` if needed

### Subheading

```
<p className="text-gray-400 max-w-2xl mx-auto">
  Upgrade to Pro and get the complete {ticker} analysis with actionable insights
</p>
```

**Typography**
- Font size: `16px` (text-base, default)
- Line height: `24px` (1.5 ratio)
- Font weight: `400` (regular)
- Color: `#9CA3AF` (gray-400)

**Layout**
- Max width: `672px` (max-w-2xl)
- Horizontal centering: `mx-auto`
- Purpose: Constrains line length for readability

## Comparison Cards Grid

### Grid Container

```
<div className="grid md:grid-cols-2 gap-4 mb-8">
  {/* Free column */}
  {/* Pro column */}
</div>
```

**Grid Specifications**
- Display: `grid`
- Columns:
  - Mobile (<768px): `1` column (default)
  - Tablet/Desktop (≥768px): `2` columns (md:grid-cols-2)
- Gap: `16px` (gap-4) between columns
- Margin bottom: `32px` (mb-8)

**Column Widths**
- Each column: `calc(50% - 8px)` on desktop
- Mobile: `100%` width each

## Free Tier Card (Left Column)

### Card Container

```
<div className="bg-[#0B1E32]/60 border border-gray-700/50 rounded-lg p-6">
```

**Background**
- Color: `#0B1E32` (dark navy)
- Opacity: `60%`
- Effect: Semi-transparent, subtle depth

**Border**
- Width: `1px`
- Color: `#374151` (gray-700) at 50% opacity
- Style: Solid
- Radius: `8px` (rounded-lg)

**Padding**
- All sides: `24px` (p-6)

### Card Header

```
<div className="flex items-center justify-between mb-5">
  <h4 className="text-lg font-bold text-gray-300">Free Tier</h4>
  <span className="text-xs text-gray-500 font-semibold px-2.5 py-1 bg-gray-700/50 rounded">
    CURRENT
  </span>
</div>
```

**Header Layout**
- Display: `flex`
- Justify: `space-between` (push elements to edges)
- Align: `items-center` (vertical center)
- Margin bottom: `20px` (mb-5)

**Title (h4)**
- Font size: `18px` (text-lg)
- Font weight: `700` (font-bold)
- Color: `#D1D5DB` (gray-300)

**Badge**
- Font size: `12px` (text-xs)
- Font weight: `600` (font-semibold)
- Color: `#6B7280` (gray-500)
- Padding: `10px horizontal × 4px vertical` (px-2.5 py-1)
- Background: `#374151` (gray-700) at 50% opacity
- Border radius: `4px` (rounded, default)

### Feature List

```
<ul className="space-y-3.5">
  <li className="flex items-start gap-3 text-sm text-gray-400">
    <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
    <span>Daily email with picks</span>
  </li>
  {/* More features... */}
</ul>
```

**List Styling**
- List style: None (default for ul)
- Spacing: `14px` between items (space-y-3.5)

**List Item (Included Features)**
- Display: `flex`
- Alignment: `items-start` (top-align icon with text)
- Gap: `12px` (gap-3)
- Text size: `14px` (text-sm)
- Text color: `#9CA3AF` (gray-400)

**List Item (Missing Features)**
- Same as above, plus:
- Opacity: `40%`
- Icon: `XCircle` instead of `CheckCircle2`

**Icon Specifications**
- Size: `16px × 16px` (w-4 h-4)
- Color:
  - Included: `#6B7280` (gray-500)
  - Missing: `#4B5563` (gray-600)
- Flex-shrink: `0` (prevent icon from shrinking)
- Margin-top: `2px` (mt-0.5) for optical alignment

## Pro Tier Card (Right Column)

### Card Container

```
<div className="relative bg-gradient-to-br from-[#00ff88]/10 to-[#00dd77]/5 border-2 border-[#00ff88]/40 rounded-lg p-6 shadow-lg shadow-[#00ff88]/10">
```

**Background**
- Gradient: `bg-gradient-to-br` (top-left to bottom-right)
- Start: `#00ff88` at 10% opacity
- End: `#00dd77` at 5% opacity
- Effect: Subtle green glow, more intense at top-left

**Border**
- Width: `2px` (border-2) - **thicker than Free card**
- Color: `#00ff88` at 40% opacity
- Style: Solid
- Radius: `8px` (rounded-lg)

**Shadow**
- Size: `large` (shadow-lg)
- Color: `#00ff88` at 10% opacity
- Effect: Green glow around card, elevation

**Padding**
- All sides: `24px` (p-6)

### Recommended Badge

```
<div className="absolute -top-3 -right-3 bg-[#00ff88] text-[#0B1E32] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
  RECOMMENDED
</div>
```

**Positioning**
- Position: `absolute`
- Top: `-12px` (-top-3) - extends above card
- Right: `-12px` (-right-3) - extends beyond card edge
- Purpose: Creates "sticker" effect

**Styling**
- Background: `#00ff88` (full brightness green)
- Text color: `#0B1E32` (dark navy, high contrast)
- Font size: `12px` (text-xs)
- Font weight: `700` (font-bold)
- Padding: `12px horizontal × 4px vertical` (px-3 py-1)
- Border radius: `9999px` (rounded-full)
- Shadow: `large` (shadow-lg) for elevation

### Card Header

```
<div className="flex items-center justify-between mb-5">
  <h4 className="text-lg font-bold text-white">Pro Tier</h4>
  <span className="text-xs text-[#00ff88] font-semibold px-2.5 py-1 bg-[#00ff88]/20 rounded">
    UPGRADE
  </span>
</div>
```

**Header Layout**
- Identical structure to Free card header

**Title (h4)**
- Font size: `18px` (text-lg)
- Font weight: `700` (font-bold)
- Color: `#FFFFFF` (white) - **brighter than Free card**

**Badge**
- Font size: `12px` (text-xs)
- Font weight: `600` (font-semibold)
- Color: `#00ff88` (brand green)
- Padding: `10px horizontal × 4px vertical`
- Background: `#00ff88` at 20% opacity
- Border radius: `4px`

### Feature List

```
<ul className="space-y-3.5">
  <li className="flex items-start gap-3 text-sm text-white">
    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
    <span className="font-medium">Everything in Free, plus:</span>
  </li>
  <li className="flex items-start gap-3 text-sm text-gray-200">
    <CheckCircle2 className="w-4 h-4 text-[#00ff88] flex-shrink-0 mt-0.5" />
    <span><strong className="text-white">Complete technical analysis</strong> with charts</span>
  </li>
  {/* More features... */}
</ul>
```

**List Item Typography**
- Base text: `14px` (text-sm)
- Color:
  - First item: `#FFFFFF` (white), medium weight
  - Others: `#E5E7EB` (gray-200)
- Bold keywords: `#FFFFFF` (white), `700` weight
- Structure: `<strong>Keyword</strong> description`

**Icon Specifications**
- Size: `16px × 16px`
- Color: `#00ff88` (full brightness green)
- Stroke width: Default (2px)
- Visual effect: Creates green rhythm down the list

## CTA Section

### Button

```
<a
  href="/#pricing"
  className="inline-flex items-center gap-2 px-8 py-4 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#00ff88]/30 text-lg"
>
  Upgrade to Pro — $10/month
  <ArrowRight className="w-5 h-5" />
</a>
```

**Layout**
- Display: `inline-flex`
- Alignment: `items-center`
- Gap: `8px` (gap-2) between text and icon

**Sizing**
- Padding: `32px horizontal × 16px vertical` (px-8 py-4)
- Height: `56px` total (text + padding)
- Width: Auto (shrink-wraps content)

**Colors**
- Background (default): `#00ff88` (brand green)
- Background (hover): `#00dd77` (darker green)
- Text: `#0B1E32` (dark navy, high contrast)

**Typography**
- Font size: `18px` (text-lg)
- Font weight: `700` (font-bold)
- Letter spacing: Normal

**Border**
- Radius: `8px` (rounded-lg)
- Border: None

**States & Transitions**

**Default State**
- Background: `#00ff88`
- Scale: `1`
- Shadow: None

**Hover State**
- Background: `#00dd77`
- Scale: `1.05` (5% larger)
- Shadow: `large` with `#00ff88` at 30% opacity
- Cursor: `pointer`

**Focus State**
- Outline: `2px solid #00ff88`
- Outline offset: `2px`

**Active State**
- Scale: `0.98` (slight press effect)

**Transition**
- Properties: `all`
- Duration: `200ms`
- Easing: `ease-in-out`

**Icon**
- Component: `ArrowRight` from lucide-react
- Size: `20px × 20px` (w-5 h-5)
- Color: Inherits text color

### Trust Indicators

```
<div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400 flex-wrap">
  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
    <span>60-day money-back guarantee</span>
  </div>
  {/* More indicators... */}
</div>
```

**Container Layout**
- Display: `flex`
- Alignment: `items-center justify-center`
- Gap: `24px` (gap-6) between items
- Wrap: `flex-wrap` (allows multiple rows on small screens)
- Margin top: `24px` (mt-6)

**Individual Indicator**
- Display: `flex`
- Alignment: `items-center`
- Gap: `8px` (gap-2) between icon and text

**Typography**
- Font size: `14px` (text-sm)
- Font weight: `400` (regular)
- Color: `#9CA3AF` (gray-400)

**Icon**
- Component: `CheckCircle2`
- Size: `16px × 16px` (w-4 h-4)
- Color: `#00ff88` (brand green)

## Responsive Breakpoints

### Desktop (≥1024px)
```css
- Section padding: 40px
- Grid columns: 2
- Headline: 30px
- Button: inline-flex (auto width)
- Trust indicators: single row
```

### Tablet (768px - 1023px)
```css
- Section padding: 32px
- Grid columns: 2
- Headline: 30px
- Button: inline-flex
- Trust indicators: may wrap to 2 rows
```

### Mobile (<768px)
```css
- Section padding: 32px
- Grid columns: 1 (vertical stack)
- Headline: 30px (or scale to 28px if needed)
- Button: full width option (can add w-full on mobile)
- Trust indicators: wrap to multiple rows
- Free card shown first, Pro card second
```

### Mobile-Specific Adjustments (Example)

```tsx
// Optional mobile optimizations
<h3 className="text-3xl sm:text-2xl font-bold...">  // Smaller on mobile
<a className="... w-full sm:w-auto ...">  // Full width on mobile
```

## Color Reference Table

| Element | Color Value | Hex Code | Usage |
|---------|-------------|----------|-------|
| Primary Green | `#00ff88` | Full opacity | Icons, borders, accents |
| Dark Green | `#00dd77` | Full opacity | Button hover state |
| Dark Navy | `#0B1E32` | Full opacity | Background, button text |
| Medium Blue-Gray | `#1a3a52` | Full opacity | Gradient start |
| White | `#FFFFFF` | Full opacity | Primary text, Pro headings |
| Gray-200 | `#E5E7EB` | Full opacity | Pro feature descriptions |
| Gray-300 | `#D1D5DB` | Full opacity | Free tier heading |
| Gray-400 | `#9CA3AF` | Full opacity | Free features, subheading |
| Gray-500 | `#6B7280` | Full opacity | Free icons, badge text |
| Gray-600 | `#4B5563` | Full opacity | Missing feature icons |
| Gray-700 | `#374151` | Full opacity | Free card border |

## Spacing Scale Reference

| Token | Value | Tailwind Class | Usage in Section |
|-------|-------|----------------|------------------|
| xs | 2px | `0.5` | Icon optical alignment |
| sm | 4px | `1` | Small gaps, tight spacing |
| md | 8px | `2` | Default gap (badge, icon-text) |
| lg | 12px | `3` | Feature list gap |
| xl | 14px | `3.5` | Feature list spacing (custom) |
| 2xl | 16px | `4` | Grid gap, badge margin |
| 3xl | 20px | `5` | Card header margin |
| 4xl | 24px | `6` | Card padding, trust indicators margin |
| 5xl | 32px | `8` | Section bottom margin, comparison grid margin |
| 6xl | 40px | `10` | Section padding (desktop) |

## Animation Specifications

### Button Hover Animation

```css
transition-all: all 200ms ease-in-out;

/* Transforms */
scale: 1 → 1.05 (5% increase)

/* Shadow */
none → shadow-lg + shadow-[#00ff88]/30
```

**Performance Notes**
- Uses `transform` for scale (GPU accelerated)
- Shadow animation is smooth but heavier
- Overall performance: Excellent on modern devices

### Focus States

```css
/* Button focus ring */
outline: 2px solid #00ff88;
outline-offset: 2px;
```

**Accessibility**: Visible focus indicator for keyboard navigation

## Print Styles (Optional)

```css
@media print {
  .pro-features-section {
    background: white !important;
    border: 1px solid black;
    box-shadow: none;
  }

  .pro-card {
    border: 2px solid black;
  }

  /* Hide decorative elements */
  .background-decoration {
    display: none;
  }
}
```

## Dark Mode Considerations

This design is built for dark mode by default. For light mode support:

```css
/* Light mode overrides (if needed) */
.light .pro-features-section {
  background: linear-gradient(to bottom right, #E5E7EB, #F9FAFB);
  border-color: #00ff88;
}

.light .free-card {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.light .pro-card {
  background: linear-gradient(to bottom right, #D1FAE5, #ECFDF5);
  border-color: #10B981;
}
```

## Implementation Notes

1. **All measurements use Tailwind utility classes** for consistency
2. **Custom values** (like `space-y-3.5`) are supported by Tailwind's JIT compiler
3. **Opacity values** use Tailwind's `/` syntax (e.g., `bg-[#00ff88]/20`)
4. **Icons from lucide-react** maintain consistent stroke width (2px default)
5. **Responsive classes** use `md:` prefix for tablet/desktop breakpoints
6. **Hover states** use `hover:` prefix, automatically apply only on hover-capable devices
7. **Focus states** automatically added by browser, enhanced with custom outline
