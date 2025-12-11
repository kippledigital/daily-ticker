---
name: Daily Ticker Brand Guide
overview: Create a comprehensive brand guide document that breaks down all visual design elements (colors, fonts, typography, spacing, UI patterns) from the Daily Ticker codebase for use in Figma case study designs.
todos: []
---

# Daily Ticker Brand Guide

## Overview

This document provides a complete breakdown of the Daily Ticker visual design system extracted from the codebase, to be used for creating on-brand case study visuals in Figma.

## Color Palette

### Primary Colors

- **Background**: `#0B1E32` (Deep navy blue - main background)
- **Foreground/Text**: `#F0F0F0` (Light gray - primary text)
- **LED Green** (Primary accent): `#00FF88` (Bright green - CTAs, highlights, positive indicators)
- **LED Red** (Negative indicator): `#FF3366` (Red - negative changes, errors)

### Secondary Colors

- **Card Background**: `#1a3a52` (Medium blue-gray - cards, borders)
- **Card Background (30% opacity)**: `#1a3a52/30` (Semi-transparent cards)
- **Border Color**: `#1a3a52` (Borders, dividers)
- **Border Accent**: `#00ff88/20` to `#00ff88/40` (Green borders with opacity)
- **Text Secondary**: `#gray-300` (Secondary text)
- **Text Tertiary**: `#gray-400` (Tertiary text)

### Semantic Colors

- **Success/Positive**: `#00FF88` (Green)
- **Error/Negative**: `#FF3366` or `#ff4444` (Red)
- **Warning**: `yellow-400` (Yellow for medium risk)
- **Info**: `#00ff88` (Green for informational states)

### Color Usage Patterns

- Green glow effects: `rgba(0, 255, 136, 0.3)` (box-shadow)
- Green text shadow: `0 0 10px currentColor` (for LED-style text)
- Hover states: `#00dd77` (darker green for hover)
- Background gradients: `from-[#1a3a52] to-[#0B1E32]`

## Typography

### Font Families

- **Primary (Sans-serif)**: `Inter` (weights: 400, 500, 600, 700)
- Used for: Body text, headings, UI elements
- Fallback: `system-ui, sans-serif`

- **Monospace**: `Space Mono` (weights: 400, 700)
- Used for: Stock tickers, numbers, technical data, brand name "Daily Ticker"
- Special class: `.led-text` (with text-shadow glow effect)

### Font Sizes & Hierarchy

- **Hero Headline**: `text-5xl md:text-7xl` (48px/72px) - Bold, white
- **Section Headings**: `text-2xl md:text-3xl` (24px/30px) - Bold, white
- **Card Headings**: `text-xl` (20px) - Bold, white
- **Body Large**: `text-lg` (18px) - Regular, gray-300
- **Body**: `text-base` (16px) - Regular, gray-300
- **Body Small**: `text-sm` (14px) - Regular, gray-300
- **Tiny**: `text-xs` (12px) - Regular, gray-400

### Font Weights

- **Bold**: `font-bold` (700) - Headings, CTAs, important text
- **Semibold**: `font-semibold` (600) - Subheadings, emphasis
- **Medium**: `font-medium` (500) - Secondary emphasis
- **Regular**: `font-normal` (400) - Body text

## Spacing & Layout

### Container & Padding

- **Container**: `container mx-auto px-4` (max-width with auto margins, 16px horizontal padding)
- **Section Padding**: `py-12 md:py-16` (48px/64px vertical)
- **Card Padding**: `p-6` to `p-8` (24px-32px)
- **Button Padding**: `px-4 py-2` to `px-6 py-3` (16-24px horizontal, 8-12px vertical)

### Border Radius

- **Small**: `rounded-lg` (8px) - Buttons, badges
- **Medium**: `rounded-xl` (12px) - Cards
- **Large**: `rounded-2xl` (16px) - Large cards, modals
- **Full**: `rounded-full` - Pills, badges, indicators

### Gaps & Spacing Scale

- **Tight**: `gap-2` (8px)
- **Small**: `gap-3` (12px)
- **Medium**: `gap-4` (16px)
- **Large**: `gap-6` (24px)
- **XLarge**: `gap-8` (32px)

## UI Components & Patterns

### Buttons

- **Primary CTA**: 
- Background: `#00FF88`
- Text: `#0B1E32` (dark)
- Hover: `#00dd77`
- Shadow: `shadow-lg shadow-[#00ff88]/30`
- Border radius: `rounded-lg`
- Font: Bold, `text-sm` to `text-base`

- **Secondary Button**:
- Background: `#1a3a52`
- Text: White
- Border: `border border-[#00ff88]/20`
- Hover: `#244a62`

### Cards

- **Standard Card**:
- Background: `bg-[#1a3a52]/30`
- Border: `border border-[#1a3a52]`
- Border radius: `rounded-lg` or `rounded-2xl`
- Padding: `p-6` to `p-8`

- **Premium Card** (Pro tier):
- Background: `bg-gradient-to-br from-[#1a3a52] to-[#0B1E32]`
- Border: `border-2 border-[#00ff88]/40`
- Glow effect on border

### Badges & Indicators

- **Status Badge** (Live/Delivered):
- Background: `bg-[#00ff88]/10`
- Border: `border border-[#00ff88]/20`
- Text: `text-[#00ff88]`
- Includes pulsing dot indicator

- **Risk Badges**:
- Low: `bg-[#00ff88]/10 text-[#00ff88]`
- Medium: `bg-yellow-500/10 text-yellow-400`
- High: `bg-red-500/10 text-red-400`

### Input Fields

- **Email Input**:
- Background: `bg-[#1a3a52]`
- Border: `border-[#2a4a62]`
- Focus: `focus-visible:ring-[#00ff88] focus-visible:border-[#00ff88]`
- Text: White
- Placeholder: `text-gray-200`

### Dividers

- **Section Divider**: `border-t border-[#1a3a52]`
- **Card Divider**: `divide-x divide-[#1a3a52]` or `border-b border-[#1a3a52]/50`

## Visual Effects & Animations

### Glow Effects

- **LED Text Glow**: `text-shadow: 0 0 10px currentColor`
- **Box Glow**: `box-shadow: 0 0 20px rgba(0, 255, 136, 0.3)`
- **Button Shadow**: `shadow-lg shadow-[#00ff88]/30`

### Animations

- **Pulse**: `animate-pulse` (for live indicators)
- **Ping**: `animate-ping` (for status dots)
- **Scroll**: `animate-scroll` (30s linear infinite - for tickers)
- **Border Beam**: Animated border effect with gradient

### Transitions

- **Color Transitions**: `transition-colors`
- **Transform**: `transition-transform`
- **All**: `transition-all`

## Icon Style

- **Icon Library**: Lucide React
- **Icon Colors**: 
- Primary: `#00FF88`
- Secondary: `text-gray-300` or `text-white`
- **Icon Sizes**: `h-4 w-4` (16px) to `h-6 w-6` (24px)

## Brand Elements

### Logo

- **Icon**: TrendingUp (from Lucide)
- **Text**: "Daily Ticker" in Space Mono, bold
- **Color**: Icon `#00FF88`, Text white

### Visual Style

- **Aesthetic**: Modern, tech-forward, financial data visualization
- **Mood**: Professional, trustworthy, data-driven
- **Key Visual**: LED-style ticker displays, glowing green accents, dark theme

## Grid & Layout Patterns

### Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

### Common Layouts

- **Hero Section**: Centered, max-width 5xl, large typography
- **Feature Grid**: `md:grid-cols-3` (3 columns on desktop)
- **Pricing Grid**: `md:grid-cols-2` (2 columns on desktop)
- **Container Max Width**: `max-w-6xl` or `max-w-5xl` for content sections

## Accessibility

### Focus States

- **Focus Ring**: `focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2`
- **Skip Links**: Green background with dark text for visibility

### Color Contrast

- White text (`#F0F0F0`) on dark background (`#0B1E32`) - High contrast
- Green (`#00FF88`) on dark background - High contrast
- Dark text (`#0B1E32`) on green (`#00FF88`) - High contrast

## Figma Implementation Notes

1. **Create Color Styles**: Set up all colors as Figma color styles
2. **Text Styles**: Create text styles for each typography combination
3. **Component Library**: Build reusable components for buttons, cards, badges
4. **Effects**: Use Figma effects for shadows and glows matching CSS values
5. **Grid System**: Use 4px or 8px grid for alignment
6. **Auto Layout**: Use auto layout for responsive components

## Key Visual Motifs

- Dark, professional background
- Bright green (#00FF88) as primary accent
- Monospace fonts for technical/financial data
- Glowing effects on important elements
- Clean, modern card-based layouts
- Pulsing indicators for live/active states