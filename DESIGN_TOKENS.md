# Daily Ticker - Design Tokens Reference

This document provides standardized design tokens to ensure visual consistency across the Daily Ticker application.

---

## Color Palette

### Brand Colors
```tsx
'brand-primary': '#00ff88',        // Main brand green
'brand-primary-hover': '#00dd77',  // Hover state for brand elements
'brand-primary-light': '#33ffaa',  // Subtle highlights and accents
```

### Background Colors
```tsx
'bg-primary': '#0B1E32',           // Main page background
'bg-secondary': '#0a1929',         // Alternative background (email preview)
'bg-card': '#1a3a52',              // Card backgrounds
'bg-card-hover': '#244a62',        // Card hover state
'bg-card-subtle': 'rgba(26, 58, 82, 0.3)',  // Semi-transparent cards
```

### Border Colors
```tsx
'border-subtle': '#1a3a52',        // Default subtle borders
'border-medium': '#2a4a62',        // Medium emphasis borders
'border-accent': '#00ff88',        // Brand accent borders
'border-accent-subtle': 'rgba(0, 255, 136, 0.2)',  // Subtle green borders
'border-accent-medium': 'rgba(0, 255, 136, 0.4)',  // Medium green borders
```

### Text Colors
```tsx
'text-primary': '#F0F0F0',         // Primary white text
'text-secondary': '#D1D5DB',       // Secondary gray text (gray-300)
'text-tertiary': '#9CA3AF',        // Tertiary gray text (gray-400) - USE CAREFULLY
'text-muted': '#6B7280',           // Muted text (gray-500) - SMALL TEXT ONLY
'text-accent': '#00ff88',          // Brand green text
```

**WCAG AA Compliance:**
- Use `text-secondary` (#D1D5DB) for normal body text (14px+)
- Use `text-primary` (#F0F0F0) for small text (< 14px)
- Avoid `text-tertiary` and `text-muted` for critical information
- Always test contrast ratios: https://webaim.org/resources/contrastchecker/

### Semantic Colors
```tsx
'success': '#00ff88',              // Success states, positive actions
'error': '#FF3366',                // Error states, destructive actions
'warning': '#FCD34D',              // Warning states, caution
'info': '#3B82F6',                 // Informational states
```

### Premium/Special Badge Colors
```tsx
'premium-bg': 'rgba(202, 138, 4, 0.2)',      // from-yellow-600/20
'premium-border': 'rgba(202, 138, 4, 0.3)',  // border-yellow-600/30
'premium-text': '#FBBF24',                    // text-yellow-400

'launch-bg-from': '#00ff88',
'launch-bg-to': '#00dd77',
'launch-text': '#0B1E32',

'early-bird-bg': 'rgba(234, 179, 8, 0.2)',   // bg-yellow-500/20
'early-bird-border': 'rgba(234, 179, 8, 0.3)', // border-yellow-500/30
'early-bird-text': '#FBBF24',                // text-yellow-400
```

---

## Typography

### Font Families
```tsx
'font-sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
'font-mono': ['Space Mono', 'Consolas', 'monospace'],
```

### Font Sizes & Usage
```tsx
// Use these exact classes for consistency
'text-xs': '0.75rem',      // 12px - Small labels, metadata, disclaimers
'text-sm': '0.875rem',     // 14px - Secondary body text, captions
'text-base': '1rem',       // 16px - Primary body text, buttons
'text-lg': '1.125rem',     // 18px - Emphasized body text, subheadings
'text-xl': '1.25rem',      // 20px - H4, card titles
'text-2xl': '1.5rem',      // 24px - H3, section subheadings
'text-3xl': '1.875rem',    // 30px - H2, section headings (mobile)
'text-4xl': '2.25rem',     // 36px - H2, section headings (desktop)
'text-5xl': '3rem',        // 48px - H1, page heroes (mobile)
'text-6xl': '3.75rem',     // 60px - Large hero text
'text-7xl': '4.5rem',      // 72px - H1, page heroes (desktop)
```

### Typography Hierarchy Standards
```tsx
// H1 - Page Heroes
'text-5xl md:text-7xl font-bold text-white leading-tight'

// H2 - Major Section Headings
'text-3xl md:text-4xl font-bold text-white'

// H3 - Section Subheadings
'text-2xl md:text-3xl font-bold text-white'

// H4 - Card Titles / Subsection Headings
'text-xl md:text-2xl font-bold text-white'

// H5 - Minor Headings
'text-lg md:text-xl font-semibold text-white'

// Body Large
'text-lg md:text-xl text-gray-300'

// Body Standard
'text-base text-gray-300 leading-relaxed'

// Body Small
'text-sm text-gray-300'

// Caption / Metadata
'text-xs text-gray-400 uppercase tracking-wider'

// Label
'text-sm font-medium text-gray-300'
```

### Font Weights
```tsx
'font-normal': 400,
'font-medium': 500,
'font-semibold': 600,
'font-bold': 700,
```

### Line Heights
```tsx
'leading-none': 1,
'leading-tight': 1.25,
'leading-snug': 1.375,
'leading-normal': 1.5,
'leading-relaxed': 1.625,
'leading-loose': 2,
```

---

## Spacing Scale

Based on 4px base unit (Tailwind's default):

```tsx
'0': '0',           // 0px
'1': '0.25rem',     // 4px
'2': '0.5rem',      // 8px
'3': '0.75rem',     // 12px
'4': '1rem',        // 16px
'5': '1.25rem',     // 20px
'6': '1.5rem',      // 24px
'8': '2rem',        // 32px
'10': '2.5rem',     // 40px
'12': '3rem',       // 48px
'16': '4rem',       // 64px
'20': '5rem',       // 80px
'24': '6rem',       // 96px
```

### Section Spacing Standards
```tsx
// Hero Sections
'py-16 md:py-24'    // 64px → 96px

// Major Content Sections
'py-12 md:py-16'    // 48px → 64px

// Minor Sections / Component Spacing
'py-8 md:py-12'     // 32px → 48px

// Card Internal Padding
'p-6'               // 24px all sides
'p-8'               // 32px all sides (large cards)

// Between Elements (Vertical)
'space-y-4'         // 16px between children
'space-y-6'         // 24px between children
'space-y-8'         // 32px between children
```

---

## Border Radius

### Border Radius Scale
```tsx
'rounded-sm': '0.25rem',    // 4px - Very small elements
'rounded': '0.25rem',       // 4px - Default
'rounded-md': '0.375rem',   // 6px - Badges, pills, small tags
'rounded-lg': '0.5rem',     // 8px - Buttons, inputs, small cards
'rounded-xl': '0.75rem',    // 12px - Medium to large cards
'rounded-2xl': '1rem',      // 16px - Large cards, major sections
'rounded-3xl': '1.5rem',    // 24px - Modals, overlays
'rounded-full': '9999px',   // Circular elements, pills, avatars
```

### Component Standards
```tsx
// Badges & Tags
'rounded-md'        // 6px

// Buttons
'rounded-lg'        // 8px

// Form Inputs
'rounded-lg'        // 8px

// Small Cards (< 300px)
'rounded-xl'        // 12px

// Medium Cards (300-600px)
'rounded-xl'        // 12px

// Large Cards (> 600px)
'rounded-2xl'       // 16px

// Hero Sections / Modals
'rounded-2xl'       // 16px

// Avatars / Pills
'rounded-full'      // Circular
```

---

## Shadows & Elevation

### Shadow Scale
```tsx
// Standard Shadows
'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
'shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
'shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

// Brand Glow Shadows (for accent elements)
'shadow-glow-sm': '0 0 10px rgba(0, 255, 136, 0.2)',
'shadow-glow-md': '0 0 20px rgba(0, 255, 136, 0.3)',
'shadow-glow-lg': '0 0 30px rgba(0, 255, 136, 0.4)',
```

### Component Usage
```tsx
// Primary CTA Buttons
'shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50'

// Cards (elevated)
'shadow-lg'

// Dropdowns / Modals
'shadow-2xl'

// Subtle Elevation
'shadow-md'
```

---

## Button Styles

### Primary CTA (Green - Main Actions)
```tsx
className="px-8 py-4 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-all duration-200 shadow-lg shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50"
```

### Secondary CTA (Dark - Supporting Actions)
```tsx
className="px-6 py-3 bg-[#1a3a52] hover:bg-[#244a62] text-white font-semibold rounded-lg transition-colors duration-200 border border-[#00ff88]/20"
```

### Ghost Button (Transparent - Tertiary Actions)
```tsx
className="px-4 py-2 bg-transparent hover:bg-[#1a3a52]/30 text-white font-medium rounded-lg transition-colors duration-200"
```

### Destructive Button (Red - Dangerous Actions)
```tsx
className="px-6 py-3 bg-[#FF3366] hover:bg-[#dd2255] text-white font-semibold rounded-lg transition-colors duration-200"
```

### Small Button Variant
Add these size modifiers to any button above:
```tsx
'px-4 py-2 text-sm'
```

### Large Button Variant
Add these size modifiers to any button above:
```tsx
'px-10 py-5 text-lg'
```

---

## Form Input Styles

### Standard Input
```tsx
className="w-full px-4 py-3 bg-[#1a3a52] border-2 border-[#2a4a62] rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all duration-200"
```

### Large Input (Hero Forms)
```tsx
className="w-full px-5 py-4 bg-[#1a3a52] border-2 border-[#2a4a62] rounded-lg text-white text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all duration-200"
```

### Textarea
```tsx
className="w-full px-4 py-3 bg-[#1a3a52] border-2 border-[#2a4a62] rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all duration-200 resize-none"
```

### Select Dropdown
```tsx
<div className="relative">
  <select className="w-full px-4 py-3 pr-10 bg-[#1a3a52] border-2 border-[#2a4a62] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:border-[#00ff88] transition-all duration-200 appearance-none cursor-pointer">
    {/* options */}
  </select>
  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00ff88] pointer-events-none" />
</div>
```

---

## Card Styles

### Standard Card
```tsx
className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6 space-y-4"
```

### Elevated Card (Hover Effect)
```tsx
className="bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6 hover:border-[#00ff88]/50 hover:bg-[#1a3a52]/20 hover:shadow-lg hover:shadow-[#00ff88]/10 transition-all duration-300"
```

### Premium Card (Gradient Border)
```tsx
className="bg-gradient-to-br from-[#1a3a52] to-[#0B1E32] border-2 border-[#00ff88]/40 rounded-2xl p-8 space-y-6 relative"
```

### Subtle Card (Less Emphasis)
```tsx
className="bg-[#0B1E32]/60 border border-[#1a3a52]/50 rounded-lg p-4"
```

---

## Badge Styles

### Small Badge
```tsx
className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md"
```

### Medium Badge
```tsx
className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md"
```

### Large Badge
```tsx
className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg"
```

### Premium Badge (Locked Feature)
```tsx
className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-md text-yellow-400"
```

### Status Badge (Success)
```tsx
className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-md text-[#00ff88]"
```

### Pill Badge (Rounded Full)
```tsx
className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a3a52] border border-[#2a4a62] rounded-full text-white"
```

---

## Icon Sizes

### Size Standards
```tsx
'h-3 w-3'    // 12px - Extra small (inline with small text)
'h-4 w-4'    // 16px - Small (standard UI icons, inline with text)
'h-5 w-5'    // 20px - Medium (prominent UI icons)
'h-6 w-6'    // 24px - Large (section headers, logos)
'h-8 w-8'    // 32px - Extra large (hero elements)
'h-10 w-10'  // 40px - Feature icons (with container)
'h-12 w-12'  // 48px - Hero icons (with container)
```

### Usage by Context
```tsx
// Inline with body text
'h-4 w-4'

// Inline with headings
'h-5 w-5'

// Navigation / Header
'h-6 w-6'

// Section icons (with background)
'h-10 w-10' (icon) + 'h-12 w-12' (container)

// Hero icons
'h-12 w-12' (icon) + 'h-16 w-16' (container)

// Loading spinners
'h-6 w-6' (standard)
'h-8 w-8' (large sections)
```

---

## Animation & Transitions

### Transition Durations
```tsx
'duration-100': '100ms',    // Ultra-fast (micro-interactions)
'duration-150': '150ms',    // Very fast (hover states)
'duration-200': '200ms',    // Fast (default transitions)
'duration-300': '300ms',    // Medium (card effects)
'duration-500': '500ms',    // Slow (modal entrances)
'duration-700': '700ms',    // Very slow (complex animations)
```

### Easing Functions
```tsx
'ease-linear': 'linear',
'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
```

### Common Transition Patterns
```tsx
// Hover state transitions
'transition-colors duration-200'

// All-property transitions
'transition-all duration-300'

// Transform-only (best performance)
'transition-transform duration-200'

// Opacity fades
'transition-opacity duration-300'
```

### Animation Usage
```tsx
// Pulsing dot (live indicator)
'animate-pulse'

// Spinning loader
'animate-spin'

// Ping effect (notifications)
'animate-ping'

// Bounce effect
'animate-bounce'
```

---

## Responsive Breakpoints

### Breakpoint System
```tsx
'sm': '640px',    // Small tablets
'md': '768px',    // Tablets
'lg': '1024px',   // Desktops
'xl': '1280px',   // Large desktops
'2xl': '1536px',  // Extra large screens
```

### Common Responsive Patterns
```tsx
// Hide on mobile, show on desktop
'hidden md:block'

// Show on mobile, hide on desktop
'md:hidden'

// Responsive text sizes
'text-base md:text-lg lg:text-xl'

// Responsive spacing
'py-8 md:py-12 lg:py-16'

// Responsive grids
'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

// Responsive flex direction
'flex flex-col md:flex-row'
```

---

## Accessibility Guidelines

### Focus States
All interactive elements must have visible focus indicators:
```tsx
'focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-[#0B1E32]'
```

### Touch Targets
Minimum touch target size: 44x44px
```tsx
// Buttons and clickable elements
'min-h-[44px] min-w-[44px]'
```

### ARIA Labels
Always include for icons without text:
```tsx
<button aria-label="Close menu">
  <X className="h-6 w-6" />
</button>
```

### Screen Reader Text
For visually hidden text that screen readers need:
```tsx
<span className="sr-only">Loading</span>
```

### Color Contrast Requirements
- **Normal text (14-18px):** Minimum 4.5:1 contrast ratio
- **Large text (18px+ or 14px+ bold):** Minimum 3:1 contrast ratio
- **UI components & graphics:** Minimum 3:1 contrast ratio

### Motion Preferences
Respect user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Component-Specific Standards

### Loading States
```tsx
<div className="flex flex-col items-center justify-center gap-4 py-12">
  <Loader2 className="h-8 w-8 animate-spin text-[#00ff88]" />
  <p className="text-base text-gray-300">Loading...</p>
</div>
```

### Success Messages
```tsx
<div className="flex items-center gap-3 p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg">
  <CheckCircle2 className="h-5 w-5 text-[#00ff88] flex-shrink-0" />
  <p className="text-sm font-medium text-[#00ff88]">Success message here</p>
</div>
```

### Error Messages
```tsx
<div className="flex items-center gap-3 p-4 bg-[#FF3366]/10 border border-[#FF3366]/20 rounded-lg">
  <AlertCircle className="h-5 w-5 text-[#FF3366] flex-shrink-0" />
  <p className="text-sm font-medium text-[#FF3366]">Error message here</p>
</div>
```

### Empty States
```tsx
<div className="text-center py-20 max-w-md mx-auto">
  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#1a3a52]/30 border-2 border-[#1a3a52] mb-6">
    <Icon className="h-10 w-10 text-gray-400" />
  </div>
  <h3 className="text-2xl font-bold text-white mb-3">Empty State Title</h3>
  <p className="text-base text-gray-300 mb-6">Description text here</p>
  <Button>Call to Action</Button>
</div>
```

---

## Usage Guidelines

### When to Use Each Token

**Colors:**
- Always use brand green (#00ff88) for primary CTAs and accents
- Use semantic colors consistently (success, error, warning)
- Never use pure black (#000000) - use bg-primary (#0B1E32) instead
- Test all color combinations for WCAG AA compliance

**Typography:**
- Use consistent heading hierarchy (H1 → H2 → H3)
- Never skip heading levels for visual effect (use classes instead)
- Use font-mono for numerical data, tickers, and code
- Maintain line-height: normal (1.5) for body text

**Spacing:**
- Use multiples of 4px for all spacing values
- Maintain consistent section padding (py-12 md:py-16)
- Use space-y-* utilities for consistent vertical rhythm
- Avoid arbitrary values; use scale tokens

**Borders & Shadows:**
- Use consistent border-radius for similar component types
- Apply shadows sparingly (primary CTAs, elevated cards)
- Use brand glow shadows only on accent elements
- Border thickness: 1px (default), 2px (emphasis)

**Buttons:**
- Always use consistent button styles (Primary, Secondary, Ghost)
- Include proper hover and focus states
- Maintain adequate padding for touch targets (min 44x44px)
- Use loading states for async actions

**Forms:**
- All inputs must have matching styles
- Include clear focus indicators
- Provide immediate validation feedback
- Use proper label associations

---

## Development Workflow

### Implementing Design Tokens

1. **Reference this document** when building new components
2. **Copy exact class strings** rather than recreating
3. **Test responsive breakpoints** on all screen sizes
4. **Verify accessibility** with automated tools
5. **Review color contrast** for all text combinations

### Adding New Tokens

When adding new design tokens:
1. Check if existing tokens can be used first
2. Ensure new token follows naming conventions
3. Document usage guidelines
4. Update this reference document
5. Communicate changes to the team

### Token Naming Conventions
- Use kebab-case for multi-word tokens
- Include context in name (button-primary, text-secondary)
- Group related tokens together
- Avoid abbreviations unless widely understood

---

## Quick Reference Cheat Sheet

### Most Common Combinations

**Primary CTA Button:**
```tsx
px-8 py-4 bg-[#00ff88] hover:bg-[#00dd77] text-[#0B1E32] font-bold rounded-lg transition-all shadow-lg shadow-[#00ff88]/30
```

**Standard Card:**
```tsx
bg-[#1a3a52]/30 border border-[#1a3a52] rounded-xl p-6
```

**Form Input:**
```tsx
px-4 py-3 bg-[#1a3a52] border-2 border-[#2a4a62] rounded-lg text-white focus:ring-2 focus:ring-[#00ff88]
```

**Section Spacing:**
```tsx
py-12 md:py-16
```

**Heading (H2):**
```tsx
text-3xl md:text-4xl font-bold text-white
```

**Body Text:**
```tsx
text-base text-gray-300 leading-relaxed
```

---

**Last Updated:** October 31, 2025
**Version:** 1.0
**Maintained By:** Design Team
