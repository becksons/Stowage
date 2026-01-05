/**
 * Utility functions for Reddit Pixel tracking
 * Handles PageVisit, conversions (Purchase, SignUp, Lead, etc), and deduplication
 */

export interface ConversionEvent {
  value?: number;
  currency?: string;
  conversionId?: string;
  [key: string]: any;
}

/**
 * Track a PageVisit event (fires automatically, but can be called manually if needed)
 */
export function trackPageVisit() {
  if (typeof window !== "undefined" && window.rdt) {
    window.rdt("track", "PageVisit");
  }
}

/**
 * Track a Purchase conversion
 * @param value - Purchase amount
 * @param currency - Currency code (default: "USD")
 * @param conversionId - Unique ID for deduplication with server-side CAPI
 */
export function trackPurchase(value: number, currency = "USD", conversionId?: string) {
  if (typeof window !== "undefined" && window.rdt) {
    window.rdt("track", "Purchase", {
      value,
      currency,
      ...(conversionId && { conversionId }),
    });
  }
}

/**
 * Track a SignUp conversion
 * @param conversionId - Unique ID for deduplication with server-side CAPI
 */
export function trackSignUp(conversionId?: string) {
  if (typeof window !== "undefined" && window.rdt) {
    window.rdt("track", "SignUp", {
      ...(conversionId && { conversionId }),
    });
  }
}

/**
 * Track a Lead conversion
 * @param conversionId - Unique ID for deduplication with server-side CAPI
 */
export function trackLead(conversionId?: string) {
  if (typeof window !== "undefined" && window.rdt) {
    window.rdt("track", "Lead", {
      ...(conversionId && { conversionId }),
    });
  }
}

/**
 * Track a generic conversion event
 * @param eventName - Name of the event (e.g., "PageVisit", "ViewContent", "Search", "AddToCart", "AddToWishlist")
 * @param data - Event data
 */
export function trackEvent(eventName: string, data?: ConversionEvent) {
  if (typeof window !== "undefined" && window.rdt) {
    window.rdt("track", eventName, data || {});
  }
}

/**
 * Verify the pixel is loaded (for debugging)
 */
export function isRedditPixelReady(): boolean {
  return typeof window !== "undefined" && typeof window.rdt === "function";
}
