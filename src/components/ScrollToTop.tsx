import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position to the top on every route change,
 * so navigating "home" (or anywhere) always lands at the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Use 'instant' so users don't see an animated scroll on navigation
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
