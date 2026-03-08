const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const tierLevelRange: Record<string, { levels: string[]; maxLevel: string; context: string }> = {
  junior: {
    levels: ['Beginner', 'Junior'],
    maxLevel: 'Junior',
    context: 'This was a JUNIOR tier test. The maximum achievable level is Junior. Even with a perfect score, the user shows Junior-level competency.',
  },
  middle: {
    levels: ['Junior', 'Middle'],
    maxLevel: 'Middle',
    context: 'This was a MIDDLE tier test. The maximum achievable level is Middle. Even with a perfect score, the user shows Middle-level competency.',
  },
  senior: {
    levels: ['Middle', 'Senior'],
    maxLevel: 'Senior',
    context: 'This was a SENIOR tier test. The user can achieve up to Senior level.',
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, tier, questions, answers, score } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const tierInfo = tierLevelRange[tier] || tierLevelRange['junior'];
    const answersText = questions.map((q: any, i: number) =>
      `Q${i + 1}: ${q.q}\nSelected answer: ${q.options[answers[i]]}`
    ).join('\n\n');

    const prompt = `You are an expert IT career evaluator. A user just took a skill test for the role of "${role}".

Tier selected: ${tier.toUpperCase()}
Score: ${score}

IMPORTANT CONSTRAINT: ${tierInfo.context}
You MUST only assign one of these levels: ${tierInfo.levels.join(' or ')}.
Do NOT assign a level outside this range, even if performance seems higher.

Here are their answers:
${answersText}

The correct answers are always the FIRST option (index 0) for each question.

Based on their performance within this tier, assign the appropriate level from: ${tierInfo.levels.join(', ')}.

Guidelines for ${tier} tier:
${tier === 'junior' ? '- Beginner: 0-2 correct\n- Junior: 3+ correct' : ''}
${tier === 'middle' ? '- Junior: 0-2 correct\n- Middle: 3+ correct' : ''}
${tier === 'senior' ? '- Middle: 0-2 correct\n- Senior: 3+ correct' : ''}

Respond with a JSON object exactly like this:
{
  "level": "${tierInfo.levels[0]}",
  "feedback": "2-3 sentences of personalized, encouraging feedback. Acknowledge the tier they attempted. Be warm and supportive like a mentor to a young woman starting her career. Reference what to study next."
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

    // Enforce tier cap regardless of what AI returns
    const allowedLevels = tierInfo.levels;
    if (!allowedLevels.includes(parsed.level)) {
      parsed.level = tierInfo.maxLevel;
    }

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
