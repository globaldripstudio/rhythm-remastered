import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const ALLOWED_EVENT_TYPES = ['page_view', 'button_click', 'cta_click']

const truncate = (val: string | null | undefined, max: number): string | null => {
  if (!val) return null
  return val.slice(0, max)
}

// Simple in-memory rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 60
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event_type, page_path, button_name, referrer, user_agent, session_id } = await req.json()

    if (!page_path || typeof page_path !== 'string') {
      return new Response(JSON.stringify({ error: 'page_path required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate event_type against allowlist
    const safeEventType = ALLOWED_EVENT_TYPES.includes(event_type) ? event_type : 'page_view'

    // Get IP from headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                       req.headers.get('cf-connecting-ip') || 
                       'unknown'

    // Rate limit check
    if (isRateLimited(ip_address)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Try to get geolocation from IP using HTTPS API
    let city = null
    let country = null
    let country_code = null

    if (ip_address && ip_address !== 'unknown' && ip_address !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`https://ipwho.is/${ip_address}?fields=city,country,country_code`, {
          signal: AbortSignal.timeout(2000)
        })
        if (geoRes.ok) {
          const geo = await geoRes.json()
          if (geo.success !== false) {
            city = geo.city || null
            country = geo.country || null
            country_code = geo.country_code || null
          }
        }
      } catch {
        // Geolocation failed, continue without it
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('site_analytics').insert({
      event_type: safeEventType,
      page_path: truncate(page_path, 500)!,
      button_name: truncate(button_name, 100),
      referrer: truncate(referrer, 1000),
      user_agent: truncate(user_agent, 1000),
      ip_address: truncate(ip_address, 45),
      city: truncate(city, 100),
      country: truncate(country, 100),
      country_code: truncate(country_code, 10),
      session_id: truncate(session_id, 100)
    })

    if (error) {
      console.error('Insert error:', error)
      return new Response(JSON.stringify({ error: 'Failed to track' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Track visit error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})