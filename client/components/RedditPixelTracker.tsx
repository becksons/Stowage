import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageVisit } from "@/hooks/useRedditPixel";

/**
 * Tracks PageVisit event on every route change
 * Must be rendered inside BrowserRouter for useLocation to work
 */
export default function RedditPixelTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on every route change
    trackPageVisit();
  }, [location.pathname, location.search]);

  return null; // This component doesn't render anything
}
