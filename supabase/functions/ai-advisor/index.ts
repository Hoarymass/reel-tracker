import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, context } = await req.json()
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ text: 'Error: ANTHROPIC_API_KEY not configured in secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `${context}\n\nRequest: ${prompt}`
        }]
      })
    })

    const data = await response.json()

    // Check for API errors - show full raw response for debugging
    if (!response.ok || data.error || data.type === 'error') {
      return new Response(JSON.stringify({ text: `AI service error. Please try again.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Extract text from response
    let text = ''
    if (data.content && Array.isArray(data.content)) {
      text = data.content.map((block: any) => block.text || '').join('\n')
    }

    if (!text) {
      // Return the raw response for debugging
      text = `Debug: No text found in response. Raw: ${JSON.stringify(data).slice(0, 500)}`
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ text: `Error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
