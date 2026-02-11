import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event_type, page_path, button_name, referrer, user_agent, session_id } = await req.json()

    if (!page_path) {
      return new Response(JSON.stringify({ error: 'page_path required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get IP from headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                       req.headers.get('cf-connecting-ip') || 
                       'unknown'

    // Try to get geolocation from IP using free API
    let city = null
    let country = null
    let country_code = null

    if (ip_address && ip_address !== 'unknown' && ip_address !== '127.0.0.1') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip_address}?fields=city,country,countryCode`, {
          signal: AbortSignal.timeout(2000)
        })
        if (geoRes.ok) {
          const geo = await geoRes.json()
          city = geo.city || null
          country = geo.country || null
          country_code = geo.countryCode || null
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
      event_type: event_type || 'page_view',
      page_path,
      button_name: button_name || null,
      referrer: referrer || null,
      user_agent: user_agent || null,
      ip_address,
      city,
      country,
      country_code,
      session_id: session_id || null
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
