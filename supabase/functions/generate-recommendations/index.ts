import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user interactions
    const { data: interactions } = await supabaseClient
      .from('user_interactions')
      .select('product_id, interaction_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get all products
    const { data: products } = await supabaseClient
      .from('products')
      .select('*');

    if (!products) {
      return new Response(JSON.stringify({ error: 'No products found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build user behavior context
    const viewedProducts = interactions?.filter(i => i.interaction_type === 'view').map(i => i.product_id) || [];
    const cartProducts = interactions?.filter(i => i.interaction_type === 'add_to_cart').map(i => i.product_id) || [];
    
    const viewedProductDetails = products.filter(p => viewedProducts.includes(p.id));
    const cartProductDetails = products.filter(p => cartProducts.includes(p.id));

    // Call Lovable AI for recommendations
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a product recommendation expert. Analyze user behavior and suggest the top 3-5 products they'd be most interested in. For each recommendation, provide:
1. The product ID from the catalog
2. A compelling, personalized reason (2-3 sentences) explaining why this product fits their interests
3. A relevance score (0.0-1.0)

Respond in JSON format:
{
  "recommendations": [
    {
      "product_id": "uuid",
      "reason": "explanation",
      "score": 0.95
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Based on user behavior:

Viewed products: ${viewedProductDetails.map(p => `${p.name} (${p.category}): ${p.description}`).join('; ') || 'None'}

Cart products: ${cartProductDetails.map(p => `${p.name} (${p.category}): ${p.description}`).join('; ') || 'None'}

Available product catalog:
${products.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Description: ${p.description}, Tags: ${p.tags.join(', ')}`).join('\n')}

Please recommend 3-5 products from this catalog.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI Gateway error:', aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: 'AI recommendation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);

    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]).recommendations;
      } else {
        recommendations = JSON.parse(aiContent).recommendations;
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback: return random products
      recommendations = products.slice(0, 3).map(p => ({
        product_id: p.id,
        reason: `Based on your browsing history, we think you'll love ${p.name}. ${p.description}`,
        score: 0.8
      }));
    }

    // Store recommendations in database
    const recommendationsToStore = recommendations.map((rec: any) => ({
      user_id: user.id,
      product_id: rec.product_id,
      reason: rec.reason,
      score: rec.score,
    }));

    await supabaseClient
      .from('recommendations')
      .delete()
      .eq('user_id', user.id);

    await supabaseClient
      .from('recommendations')
      .insert(recommendationsToStore);

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});