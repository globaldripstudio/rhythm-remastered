import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = () => {
  let id = sessionStorage.getItem('analytics_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session', id);
  }
  return id;
};

const trackEvent = async (event_type: string, page_path: string, button_name?: string) => {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        event_type,
        page_path,
        button_name,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      }),
    });
  } catch {
    // Silent fail - analytics should never break the site
  }
};

export const trackButtonClick = (buttonName: string) => {
  trackEvent('button_click', window.location.pathname, buttonName);
};

export const trackCTAClick = (ctaName: string) => {
  trackEvent('cta_click', window.location.pathname, ctaName);
};

export const usePageTracking = () => {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) return;
    // Avoid double tracking
    if (lastTracked.current === location.pathname) return;
    lastTracked.current = location.pathname;

    trackEvent('page_view', location.pathname);
  }, [location.pathname]);
};
