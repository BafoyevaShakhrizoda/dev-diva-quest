const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, questions, answers } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const answersText = questions.map((q: any, i: number) =>
      `Q${i + 1}: ${q.q}\nSelected answer: ${q.options[answers[i]]}`
    ).join('\n\n');

    const prompt = `You are an expert IT career evaluator. A user just took a skill test for the role of "${role}".

Here are their answers:
${answersText}

The correct answers are always the FIRST option (index 0) for each question.

Based on their answers, evaluate their skill level. Assign one of: Beginner, Junior, Middle, Senior.

Guidelines:
- Beginner: 0-1 correct (just starting out)
- Junior: 2 correct (basic knowledge)  
- Middle: 3-4 correct (solid understanding)
- Senior: 5 correct (expert-level mastery)

Respond with a JSON object exactly like this:
{
  "level": "Junior",
  "feedback": "2-3 sentences of personalized, encouraging feedback explaining the level and what to focus on next. Be warm and supportive like a mentor to a young woman starting her career."
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('evaluate-skill error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Evaluation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
