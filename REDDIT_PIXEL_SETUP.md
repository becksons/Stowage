# Reddit Pixel Setup Guide

## ✅ What's been configured

1. **Base Pixel Script** - Added to `index.html`
   - Pixel ID: `a2_h2hxpqapvefb`
   - Auto-tracks initial page load with `PageVisit`

2. **PageVisit Tracking** - Component created: `RedditPixelTracker`
   - Automatically tracks every route change in your React app
   - Ensures SPA navigation is properly recorded

3. **Event Tracking Utilities** - Hook created: `useRedditPixel`
   - Functions for SignUp, Purchase, Lead, and custom events
   - Built-in support for deduplication with server-side CAPI

---

## 🚀 How to use it

### 1. Track a SignUp (when user creates account)

In your Auth page or sign-up handler:

```tsx
import { trackSignUp } from "@/hooks/useRedditPixel";

function handleSignUp(userId: string) {
  // ... your signup logic ...

  // Track the conversion with unique ID for CAPI dedup
  trackSignUp(`signup-${userId}-${Date.now()}`);
}
```

### 2. Track a Purchase (when user buys something)

```tsx
import { trackPurchase } from "@/hooks/useRedditPixel";

function handlePurchase(amount: number, orderId: string) {
  // ... your purchase logic ...

  // Track with value and currency
  trackPurchase(amount, "USD", `purchase-${orderId}`);
}
```

### 3. Track a Lead (contact form, inquiry, etc)

```tsx
import { trackLead } from "@/hooks/useRedditPixel";

function handleLeadSubmit(leadId: string) {
  // ... your lead logic ...

  trackLead(`lead-${leadId}`);
}
```

### 4. Track Custom Events

```tsx
import { trackEvent } from "@/hooks/useRedditPixel";

// View content
trackEvent("ViewContent", { content_id: "item-123" });

// Search
trackEvent("Search", { search_query: "blue backpack" });

// Add to cart
trackEvent("AddToCart", { value: 29.99, currency: "USD" });

// Add to wishlist
trackEvent("AddToWishlist", { content_id: "item-456" });
```

---

## 🔗 Deduplication with Server-Side CAPI

If you set up server-side tracking (Conversions API), prevent double-counting:

**Browser event:**

```tsx
trackPurchase(99.99, "USD", "conv-abc123-xyz");
```

**Server event (Node.js example):**

```javascript
// Send to Reddit CAPI with same conversionId
{
  event_name: "Purchase",
  event_id: "conv-abc123-xyz",  // ← Same unique ID
  value: 99.99,
  currency: "USD"
}
```

Reddit will deduplicate using the event ID.

---

## ✔️ Testing

### Verify pixel is loaded:

1. Open your app in a browser (ad blocker off)
2. Open DevTools Console
3. Type: `window.rdt`
4. Should return a function (not `undefined`)

### Check events in Reddit Events Manager:

1. Go to your Reddit Ads Manager
2. Click Events Manager
3. Look for incoming events from your site
4. You should see `PageVisit` on page loads and route changes
5. Custom events (SignUp, Purchase, etc) appear when triggered

---

## 📋 Available Event Types

Reddit supports these standard event names:

- `PageVisit` - Tracked automatically on every page/route change ✅
- `ViewContent` - User viewed a product/item
- `Search` - User performed a search
- `AddToCart` - User added item to cart
- `AddToWishlist` - User added to wishlist
- `Purchase` - User completed a purchase
- `SignUp` - User created an account
- `Lead` - User submitted a lead/form
- Custom events - Any string you want to track

---

## 🔒 Privacy & Best Practices

- ✅ Pixel ID is public (safe to expose in frontend code)
- ✅ Only ever use the **Anonymous/Public** key in frontend
- ✅ Keep your **Secret/Admin** key private (server-side only)
- ✅ All tracking is compliant with Reddit's pixel requirements
- ✅ Use unique `conversionId` for browser + server deduplication

---

## Next Steps (Optional)

If you want server-side CAPI:

1. Go to Reddit Events Manager → Conversions API
2. Get your endpoint URL and access token
3. From your backend, post conversion events with matching `event_id`
4. Reddit will auto-deduplicate using the ID

For questions, check: https://business.reddithelp.com/
