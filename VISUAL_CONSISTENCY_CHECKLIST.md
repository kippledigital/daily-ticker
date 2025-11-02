# Daily Ticker - Visual Consistency Checklist

Use this checklist to verify design consistency when building or reviewing components.

---

## Typography Consistency

### Heading Hierarchy
- [ ] H1 (Page Heroes): `text-5xl md:text-7xl font-bold`
- [ ] H2 (Section Headings): `text-3xl md:text-4xl font-bold`
- [ ] H3 (Subsection Headings): `text-2xl md:text-3xl font-bold`
- [ ] H4 (Card Titles): `text-xl md:text-2xl font-bold`
- [ ] All headings use `text-white`
- [ ] Headings never skip levels (H1 → H3 without H2)

### Body Text
- [ ] Primary body: `text-base text-gray-300 leading-relaxed`
- [ ] Secondary body: `text-sm text-gray-300`
- [ ] Small text: `text-xs text-gray-300` (avoid gray-400 for important info)
- [ ] Emphasized text: Uses `font-semibold` or `text-white`, not larger size

### Special Text
- [ ] Monospace numbers: `font-mono` class applied
- [ ] Labels: `text-sm font-medium text-gray-300 uppercase tracking-wider`
- [ ] Metadata: `text-xs text-gray-400 uppercase tracking-wider`

---

## Color Consistency

### Brand Color Usage
- [ ] Primary green: `#00ff88` or `text-[#00ff88]`
- [ ] Hover state: `#00dd77` or `hover:bg-[#00dd77]`
- [ ] Never use off-brand greens (lime, emerald, etc.)

### Background Colors
- [ ] Main background: `bg-[#0B1E32]`
- [ ] Cards: `bg-[#1a3a52]` or `bg-[#1a3a52]/30`
- [ ] Card hover: `hover:bg-[#1a3a52]/20` or `hover:bg-[#244a62]`
- [ ] Alternative background: `bg-[#0a1929]` (email preview only)

### Text Colors (WCAG AA Compliant)
- [ ] Primary text: `text-white` or `text-[#F0F0F0]`
- [ ] Secondary text: `text-gray-300` (#D1D5DB) ✓ AA compliant
- [ ] Tertiary text: `text-gray-400` (#9CA3AF) ⚠️ Use carefully
- [ ] Muted text: `text-gray-500` (#6B7280) ⚠️ Large text only
- [ ] Accent text: `text-[#00ff88]`

### Borders
- [ ] Subtle borders: `border-[#1a3a52]`
- [ ] Medium borders: `border-[#2a4a62]`
- [ ] Accent borders: `border-[#00ff88]` with opacity variants
- [ ] Border width: `border` (1px) or `border-2` (2px), never 3px+

---

## Spacing Consistency

### Section Padding
- [ ] Hero sections: `py-16 md:py-24`
- [ ] Major sections: `py-12 md:py-16`
- [ ] Minor sections: `py-8 md:py-12`
- [ ] Between sections: Separated by `<SectionDivider />` or consistent gap

### Card Padding
- [ ] Standard cards: `p-6`
- [ ] Large cards: `p-8`
- [ ] Compact cards: `p-4`
- [ ] Never use odd padding values (p-5, p-7)

### Element Spacing
- [ ] Vertical spacing: `space-y-4`, `space-y-6`, or `space-y-8`
- [ ] Horizontal spacing: `space-x-4`, `gap-4`, etc.
- [ ] Margins use same scale as padding (4, 6, 8, 12, 16)
- [ ] No arbitrary values unless absolutely necessary

---

## Border Radius Consistency

### By Component Type
- [ ] Badges/Pills: `rounded-md` (6px) or `rounded-full`
- [ ] Buttons: `rounded-lg` (8px)
- [ ] Form inputs: `rounded-lg` (8px)
- [ ] Small cards: `rounded-xl` (12px)
- [ ] Large cards: `rounded-2xl` (16px)
- [ ] Modals/Hero sections: `rounded-2xl` (16px)

### Never Mix
- [ ] All buttons in same context have same radius
- [ ] All cards in same section have same radius
- [ ] Form elements consistently use `rounded-lg`

---

## Button Consistency

### Primary CTA (Green)
- [ ] Background: `bg-[#00ff88] hover:bg-[#00dd77]`
- [ ] Text: `text-[#0B1E32] font-bold`
- [ ] Border radius: `rounded-lg`
- [ ] Shadow: `shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50`
- [ ] Padding: `px-8 py-4` (large) or `px-6 py-3` (standard)
- [ ] Transition: `transition-all duration-200`

### Secondary CTA (Dark)
- [ ] Background: `bg-[#1a3a52] hover:bg-[#244a62]`
- [ ] Text: `text-white font-semibold`
- [ ] Border: `border border-[#00ff88]/20`
- [ ] Border radius: `rounded-lg`
- [ ] Padding: `px-6 py-3`
- [ ] Transition: `transition-colors duration-200`

### Focus States
- [ ] All buttons have visible focus indicator
- [ ] Focus ring: `focus:ring-2 focus:ring-[#00ff88]`
- [ ] Focus visible: `focus:outline-none`

### Disabled States
- [ ] Disabled buttons: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] Loading buttons: Show `<Loader2>` icon with text

---

## Form Element Consistency

### Inputs & Textareas
- [ ] Background: `bg-[#1a3a52]`
- [ ] Border: `border-2 border-[#2a4a62]`
- [ ] Text: `text-white`
- [ ] Placeholder: `placeholder:text-gray-400`
- [ ] Padding: `px-4 py-3`
- [ ] Border radius: `rounded-lg`
- [ ] Focus: `focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88]`
- [ ] Transition: `transition-all duration-200`

### Select Dropdowns
- [ ] Same styling as inputs
- [ ] Includes `appearance-none`
- [ ] Custom icon: `<ChevronDown>` positioned absolutely
- [ ] Icon color: `text-[#00ff88]`
- [ ] Padding right: `pr-10` (to accommodate icon)

### Labels
- [ ] All inputs have associated labels
- [ ] Label text: `text-sm font-medium text-gray-300`
- [ ] Spacing below label: `mb-2`
- [ ] Required indicator: `<span className="text-red-400">*</span>`

---

## Card Consistency

### Standard Card
- [ ] Background: `bg-[#1a3a52]/30`
- [ ] Border: `border border-[#1a3a52]`
- [ ] Border radius: `rounded-xl`
- [ ] Padding: `p-6`
- [ ] Internal spacing: `space-y-4` or `space-y-6`

### Interactive Card (Hover)
- [ ] Base styling matches standard card
- [ ] Hover: `hover:border-[#00ff88]/50 hover:bg-[#1a3a52]/20`
- [ ] Shadow: `hover:shadow-lg hover:shadow-[#00ff88]/10`
- [ ] Scale: `hover:scale-[1.01]` (optional)
- [ ] Transition: `transition-all duration-300`
- [ ] Cursor: `cursor-pointer` if clickable

### Premium/Featured Card
- [ ] Background: `bg-gradient-to-br from-[#1a3a52] to-[#0B1E32]`
- [ ] Border: `border-2 border-[#00ff88]/40`
- [ ] Border radius: `rounded-2xl`
- [ ] Padding: `p-8`
- [ ] Special badge: Positioned absolutely with negative top margin

---

## Badge Consistency

### Size Variants
- [ ] Small: `px-2.5 py-1 text-xs`
- [ ] Medium: `px-3 py-1.5 text-sm`
- [ ] Large: `px-4 py-2 text-sm`
- [ ] Font weight: `font-semibold` (small/medium) or `font-bold` (large)

### Shape
- [ ] Rectangular badges: `rounded-md`
- [ ] Pill badges: `rounded-full`
- [ ] Never use `rounded` or `rounded-lg` for badges

### Premium Badge
- [ ] Background: `from-yellow-600/20 to-orange-600/20` (gradient)
- [ ] Border: `border-yellow-600/30`
- [ ] Text: `text-yellow-400`
- [ ] Icon: `<Lock className="h-3 w-3" />`

### Status Badges
- [ ] Success: `bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]`
- [ ] Error: `bg-[#FF3366]/10 border-[#FF3366]/20 text-[#FF3366]`
- [ ] Warning: `bg-yellow-500/10 border-yellow-500/20 text-yellow-400`
- [ ] Info: `bg-blue-500/10 border-blue-500/20 text-blue-400`

---

## Icon Consistency

### Size Standards
- [ ] Extra small (inline with small text): `h-3 w-3`
- [ ] Small (standard UI icons): `h-4 w-4`
- [ ] Medium (prominent icons): `h-5 w-5`
- [ ] Large (headers, logos): `h-6 w-6`
- [ ] Extra large (hero elements): `h-8 w-8`
- [ ] Feature icons: `h-10 w-10` (within container)

### Color
- [ ] Default UI icons: `text-gray-400` or `text-white`
- [ ] Accent icons: `text-[#00ff88]`
- [ ] Brand logo: `text-[#00ff88]`
- [ ] Never use colored icons without purpose

### Alignment
- [ ] Inline icons: `inline-flex items-center gap-2`
- [ ] Icons with text: Vertically centered
- [ ] Loading spinners: `animate-spin` class applied

---

## Shadow & Elevation

### When to Use Shadows
- [ ] Primary CTAs: `shadow-lg shadow-[#00ff88]/30`
- [ ] Elevated cards: `shadow-lg`
- [ ] Modals/Dropdowns: `shadow-2xl`
- [ ] Hover states: Increase shadow intensity
- [ ] Never use shadows on flat/inline elements

### Glow Effects
- [ ] Only on brand-colored elements
- [ ] Use sparingly (primary CTAs, live indicators)
- [ ] Format: `shadow-[#00ff88]/30` (30% opacity)
- [ ] Hover: Increase to 50% opacity

---

## Animation & Transitions

### Transition Durations
- [ ] Micro-interactions: `duration-150` or `duration-200`
- [ ] Card effects: `duration-300`
- [ ] Modal entrances: `duration-500`
- [ ] Never use transitions longer than 700ms

### Common Patterns
- [ ] Color changes: `transition-colors duration-200`
- [ ] All properties: `transition-all duration-300`
- [ ] Transforms only: `transition-transform duration-200`
- [ ] Always specify duration explicitly

### Animations
- [ ] Pulsing (live indicators): `animate-pulse` or `animate-ping`
- [ ] Loading spinners: `animate-spin`
- [ ] Entrance animations: Subtle, < 500ms
- [ ] Respect `prefers-reduced-motion`

---

## Responsive Design

### Breakpoint Usage
- [ ] Mobile-first approach
- [ ] Breakpoints: `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- [ ] Typography scales up: `text-5xl md:text-7xl`
- [ ] Padding scales up: `py-12 md:py-16`
- [ ] Grids adapt: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Mobile Considerations
- [ ] Touch targets minimum 44x44px
- [ ] Text remains readable (min 16px base)
- [ ] Buttons stack vertically: `flex flex-col sm:flex-row`
- [ ] Navigation accessible on mobile
- [ ] No horizontal scroll at any width

### Hide/Show at Breakpoints
- [ ] Mobile-only: Use with `md:hidden`
- [ ] Desktop-only: Use with `hidden md:block`
- [ ] Never hide critical content on mobile
- [ ] Test at 320px (iPhone SE)

---

## Accessibility Compliance

### Color Contrast
- [ ] Normal text (14-18px): 4.5:1 minimum
- [ ] Large text (18px+ or 14px+ bold): 3:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Test with WebAIM contrast checker

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Visible focus indicators on all focusable elements
- [ ] Logical tab order (matches visual order)
- [ ] No keyboard traps

### ARIA & Semantics
- [ ] All images have alt text (or `alt=""` if decorative)
- [ ] Icons without text have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Headings use semantic HTML (`<h1>`, `<h2>`, etc.)

### Screen Reader Support
- [ ] Link text is descriptive (not "click here")
- [ ] Loading states announced
- [ ] Error messages associated with fields
- [ ] Dynamic content updates announced

---

## Loading States

### Spinner with Text
```tsx
<div className="flex flex-col items-center justify-center gap-4 py-12">
  <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
  <p className="text-base text-gray-300">Loading...</p>
</div>
```

### Inline Loading (Buttons)
```tsx
{loading ? (
  <>
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
    Loading...
  </>
) : (
  <>Button Text</>
)}
```

### Skeleton Screens (Future)
- [ ] Match content layout
- [ ] Use `animate-pulse`
- [ ] Background: `bg-[#1a3a52]/50`

---

## Error & Success States

### Success Message
```tsx
<div className="flex items-center gap-3 p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg">
  <CheckCircle2 className="h-5 w-5 text-[#00ff88] flex-shrink-0" />
  <p className="text-sm font-medium text-[#00ff88]">Success message</p>
</div>
```

### Error Message
```tsx
<div className="flex items-center gap-3 p-4 bg-[#FF3366]/10 border border-[#FF3366]/20 rounded-lg">
  <AlertCircle className="h-5 w-5 text-[#FF3366] flex-shrink-0" />
  <p className="text-sm font-medium text-[#FF3366]">Error message</p>
</div>
```

### Form Validation
- [ ] Errors appear below field
- [ ] Use red color: `text-[#FF3366]`
- [ ] Include icon for visual users
- [ ] Associate with field via `aria-describedby`

---

## Empty States

### Structure
```tsx
<div className="text-center py-20 max-w-md mx-auto">
  {/* Icon container */}
  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#1a3a52]/30 border-2 border-[#1a3a52] mb-6">
    <Icon className="h-10 w-10 text-gray-400" />
  </div>
  {/* Heading */}
  <h3 className="text-2xl font-bold text-white mb-3">Empty State Title</h3>
  {/* Description */}
  <p className="text-base text-gray-300 mb-6">Description text</p>
  {/* CTA */}
  <Button>Call to Action</Button>
</div>
```

### Guidelines
- [ ] Use appropriate icon (Calendar, Inbox, etc.)
- [ ] Heading explains the situation
- [ ] Description provides context or next steps
- [ ] CTA offers way to resolve empty state

---

## Cross-Component Consistency

### Navigation/Header
- [ ] Logo: `h-6 w-6 text-[#00ff88]`
- [ ] Logo text: `text-xl font-bold font-mono`
- [ ] Nav links: `text-sm text-gray-300 hover:text-white`
- [ ] Sticky header: `sticky top-0 z-50`
- [ ] Backdrop blur: `backdrop-blur-sm`

### Footer
- [ ] Background: `bg-[#0B1E32]`
- [ ] Border top: `border-t border-[#1a3a52]`
- [ ] Grid: `grid md:grid-cols-3 gap-8`
- [ ] Section headings: `font-semibold text-white`
- [ ] Links: `text-sm text-gray-200 hover:text-[#00ff88]`

### Section Dividers
- [ ] Use `<SectionDivider />` component
- [ ] Centered with gradient line
- [ ] Animated dots at center and edges
- [ ] Padding: `py-8`

---

## Quick Pre-Flight Checks

Before committing any component:

1. **Typography**
   - [ ] Headings follow hierarchy
   - [ ] Body text is gray-300 or lighter
   - [ ] Font sizes are from scale (no arbitrary values)

2. **Colors**
   - [ ] Brand green used correctly
   - [ ] Text contrast meets WCAG AA
   - [ ] Backgrounds use approved colors

3. **Spacing**
   - [ ] Uses scale values (4, 6, 8, 12, 16)
   - [ ] Section padding consistent
   - [ ] No arbitrary margins/padding

4. **Borders & Radius**
   - [ ] Border radius matches component type
   - [ ] Border colors from approved palette
   - [ ] Border thickness is 1px or 2px

5. **Buttons**
   - [ ] Matches primary or secondary pattern
   - [ ] Has hover state
   - [ ] Has focus indicator
   - [ ] Has disabled/loading state if applicable

6. **Forms**
   - [ ] Inputs match standard styling
   - [ ] Labels are associated
   - [ ] Focus states visible
   - [ ] Error states styled consistently

7. **Responsive**
   - [ ] Works on mobile (320px+)
   - [ ] Touch targets are 44x44px minimum
   - [ ] No horizontal scroll

8. **Accessibility**
   - [ ] Keyboard navigable
   - [ ] Has focus indicators
   - [ ] Color contrast verified
   - [ ] ARIA labels where needed

9. **Performance**
   - [ ] Animations use transforms
   - [ ] Transitions are < 500ms
   - [ ] No excessive re-renders

10. **Code Quality**
    - [ ] Uses Tailwind utilities (no inline styles)
    - [ ] Classes are ordered logically
    - [ ] No duplicate classes
    - [ ] Component is reusable

---

## Common Mistakes to Avoid

### Typography
- ❌ Using `text-gray-500` for important content
- ❌ Skipping heading levels (H1 → H3)
- ❌ Mixing font weights without reason
- ✅ Use gray-300 for body, white for emphasis

### Colors
- ❌ Using lime, emerald, or other greens instead of brand green
- ❌ Using pure black (#000000) for backgrounds
- ❌ Low contrast text that fails WCAG AA
- ✅ Use #00ff88 for all brand green instances

### Spacing
- ❌ Using arbitrary values (pt-[13px])
- ❌ Inconsistent section padding
- ❌ Mixing margin and padding without reason
- ✅ Use scale values exclusively (4, 6, 8, 12, 16)

### Borders
- ❌ Using different radius on same component type
- ❌ 3px or 4px borders
- ❌ Missing border colors (defaults to gray-300)
- ✅ Consistent radius by component type

### Buttons
- ❌ Inline styling instead of using patterns
- ❌ Inconsistent padding across CTAs
- ❌ Missing hover or focus states
- ✅ Use exact button patterns from design tokens

### Responsive
- ❌ Hiding content on mobile without alternative
- ❌ Touch targets smaller than 44x44px
- ❌ Not testing at 320px width
- ✅ Mobile-first, progressive enhancement

---

## Testing Your Component

### Visual Testing
1. Compare component to similar existing components
2. Check at breakpoints: 320px, 768px, 1024px, 1920px
3. Verify spacing matches design system
4. Test hover and focus states

### Accessibility Testing
1. Tab through with keyboard only
2. Test with screen reader (VoiceOver, NVDA)
3. Check color contrast with WebAIM tool
4. Verify ARIA labels are present

### Code Review
1. All classes from Tailwind (no inline styles)
2. Consistent with DESIGN_TOKENS.md
3. No hardcoded colors outside approved palette
4. Proper semantic HTML used

---

**Last Updated:** October 31, 2025
**Version:** 1.0

Use this checklist for every new component or page to ensure visual consistency across the Daily Ticker application.
