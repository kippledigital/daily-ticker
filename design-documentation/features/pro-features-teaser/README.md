---
title: Pro Features Teaser Section - Design Documentation
description: Complete design specifications for the ticker page Pro upgrade section
feature: Pro Features Teaser
last-updated: 2025-11-11
version: 2.0.0
related-files:
  - /design-documentation/features/pro-features-teaser/design-rationale.md
  - /design-documentation/features/pro-features-teaser/implementation.md
  - /components/stocks/ticker-page-client.tsx
status: implemented
---

# Pro Features Teaser Section

## Overview

The Pro Features Teaser section appears on individual ticker pages (e.g., `/stocks/NVDA`) and serves as the primary conversion point for upgrading free users to Pro subscribers. This redesigned section uses a side-by-side comparison layout to clearly demonstrate the value differential between Free and Pro tiers.

## Design Goals

1. **Create clear value proposition** through direct Free vs Pro comparison
2. **Improve visual balance** by using symmetrical card layout
3. **Reduce vertical space** for better page flow and information density
4. **Strengthen conversion** with prominent CTA and trust indicators
5. **Enhance engagement** through strategic use of color, hierarchy, and contrast

## Key Design Decisions

### Layout Strategy: Side-by-Side Comparison

**Why this works:**
- Creates natural left-to-right reading flow (current state → desired state)
- Shows concrete feature differences rather than abstract benefits
- Builds desire through contrast and FOMO (fear of missing out)
- Familiar pattern from SaaS pricing pages increases conversion
- Mobile-responsive with vertical stack on smaller screens

### Visual Hierarchy

**Eye Flow Path:**
1. PRO FEATURES badge (green, centered) → Entry point and category identification
2. "See What You're Missing" headline → Creates curiosity and FOMO
3. Left column (Free tier) → Awareness of current state
4. Right column (Pro tier) → Desire building through feature showcase
5. Upgrade CTA button → Clear conversion action
6. Trust indicators → Risk reduction and reassurance

### Color Strategy

**Free Column:**
- Muted gray tones (`#0B1E32/60`, gray-700) convey limitation
- Desaturated checkmarks and text suggest baseline functionality
- Faded X icons (40% opacity) on missing features create visual gap

**Pro Column:**
- Green gradient background (`from-[#00ff88]/10 to-[#00dd77]/5`) suggests premium
- Bright green accents (`#00ff88`) on checkmarks draw attention
- 2px green border vs 1px gray border increases visual prominence
- White text on Pro features vs gray on Free increases contrast

### Typography Hierarchy

- **Section badge**: 12px bold uppercase with icon (green)
- **Main headline**: 30px bold (white) - conversion-focused copy
- **Subheading**: 16px regular (gray-400) - clarifying context
- **Column headers**: 18px bold - tier identification
- **Feature text**: 14px with selective bolding on Pro benefits
- **CTA button**: 18px bold - prominence through size and weight

## Component Anatomy

```
┌─────────────────────────────────────────────────────┐
│  [PRO FEATURES badge]                               │
│  See What You're Missing                            │
│  Upgrade to Pro and get complete analysis           │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  FREE TIER       │  │  PRO TIER        │        │
│  │  [CURRENT]       │  │  [RECOMMENDED]   │        │
│  │                  │  │                  │        │
│  │  ✓ Feature 1     │  │  ✓ Everything +  │        │
│  │  ✓ Feature 2     │  │  ✓ Enhanced 1    │        │
│  │  ✓ Feature 3     │  │  ✓ Enhanced 2    │        │
│  │  ✗ Missing 1     │  │  ✓ Enhanced 3    │        │
│  │  ✗ Missing 2     │  │  ✓ Enhanced 4    │        │
│  │  ✗ Missing 3     │  │  ✓ Enhanced 5    │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│         [Upgrade to Pro - $10/month]               │
│                                                     │
│   ✓ 60-day guarantee  ✓ Cancel anytime  ✓ Instant │
└─────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (1024px+)
- Two-column side-by-side layout
- Cards have equal width (50% each with gap)
- Full padding: 40px
- CTA button scales to 105% on hover with shadow

### Tablet (768px - 1023px)
- Two-column layout maintained
- Reduced padding: 32px
- Slightly smaller text sizes
- Trust indicators may wrap to two rows

### Mobile (< 768px)
- Single column vertical stack
- Free tier shown first, then Pro tier
- Full width cards
- Padding: 24px
- CTA button full width on very small screens

## Accessibility Considerations

- **Color contrast**: All text meets WCAG AA standards (4.5:1 minimum)
- **Focus states**: CTA button has visible focus ring for keyboard navigation
- **Semantic HTML**: Uses proper heading hierarchy (h3 for section, h4 for columns)
- **Icon labels**: Icons paired with descriptive text for screen readers
- **Touch targets**: CTA button exceeds 44×44px minimum for mobile

## Performance Optimizations

- **No images**: Pure CSS for all visual effects
- **GPU acceleration**: Transform and opacity for hover animations
- **Lightweight**: Minimal DOM nodes, efficient rendering
- **Blur effect**: Single background decoration element, low performance impact

## Conversion Psychology

1. **Contrast principle**: Side-by-side shows exactly what's missing
2. **Loss aversion**: "See What You're Missing" triggers FOMO
3. **Social proof**: "RECOMMENDED" badge suggests popular choice
4. **Risk reversal**: 60-day guarantee removes purchase anxiety
5. **Urgency**: "Instant access" suggests immediate value
6. **Specificity**: "$10/month" is concrete and affordable
7. **Emphasis**: Bold key phrases in Pro features increase perceived value

## Success Metrics

Track these metrics to measure section effectiveness:

- **Click-through rate (CTR)**: Clicks on CTA button / Section views
- **Conversion rate**: Pro upgrades / CTA clicks
- **Scroll depth**: % of users who scroll past section
- **Time in view**: Seconds spent viewing this section
- **A/B test variations**: Test headline, pricing display, feature order

## Related Documentation

- [Implementation Guide](./implementation.md) - Developer handoff with code examples
- [Design Rationale](./design-rationale.md) - Deep dive into design decisions
- [Visual Specifications](./visual-specs.md) - Detailed styling and spacing
- [Component Library](../../design-system/components/) - Reusable design patterns

## Version History

- **v2.0.0** (2025-11-11): Complete redesign with comparison layout
- **v1.0.0**: Original single-column layout with blurred preview card
