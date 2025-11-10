/**
 * Analytics event tracking utility
 * Tracks events to Google Analytics 4
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, any>
): void {
  if (typeof window === 'undefined') {
    return
  }

  // Check if gtag is available
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      event_category: params?.event_category || 'engagement',
      event_label: params?.event_label || undefined,
    })
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, params)
  }
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(location: string): void {
  trackEvent('newsletter_signup', {
    event_category: 'conversion',
    event_label: location,
    method: location, // 'hero_form', 'footer_form', etc.
    page_location: window.location.href,
  })
}

/**
 * Track premium checkout start
 */
export function trackCheckoutStart(priceType: 'monthly' | 'standard'): void {
  trackEvent('checkout_started', {
    event_category: 'ecommerce',
    event_label: priceType,
    value: priceType === 'monthly' ? 10 : 96,
    currency: 'USD',
  })
}

/**
 * Track premium checkout completion
 */
export function trackCheckoutComplete(
  sessionId: string,
  priceType: 'monthly' | 'standard'
): void {
  trackEvent('checkout_completed', {
    event_category: 'ecommerce',
    event_label: 'premium_subscription',
    value: priceType === 'monthly' ? 10 : 96,
    currency: 'USD',
    transaction_id: sessionId,
  })
}

/**
 * Track ROI calculator open
 */
export function trackROICalculatorOpen(): void {
  trackEvent('roi_calculator_opened', {
    event_category: 'engagement',
    event_label: 'premium_section',
  })
}

/**
 * Track archive page view
 */
export function trackArchiveView(): void {
  trackEvent('archive_viewed', {
    event_category: 'engagement',
    event_label: 'archive_page',
  })
}

/**
 * Track performance dashboard view
 */
export function trackPerformanceDashboardView(): void {
  trackEvent('performance_dashboard_viewed', {
    event_category: 'engagement',
    event_label: 'homepage_dashboard',
  })
}

