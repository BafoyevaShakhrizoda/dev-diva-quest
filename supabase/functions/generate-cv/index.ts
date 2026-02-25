const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cv } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `You are a professional CV writer specializing in IT careers. Create a polished, ATS-friendly CV for the following candidate. Use clear sections with headings. Be professional but also highlight uniqueness. Make the summary compelling.

Candidate data:
Name: ${cv.name}
Role: ${cv.role}
Email: ${cv.email}
Phone: ${cv.phone}
Location: ${cv.location}
Summary: ${cv.summary}

Experience:
${cv.experience.map((e: any) => `- ${e.title} at ${e.company} (${e.duration}): ${e.description}`).join('\n')}

Education:
${cv.education.map((e: any) => `- ${e.degree} at ${e.school} (${e.year})`).join('\n')}

Skills: ${cv.skills.filter(Boolean).join(', ')}
Languages: ${cv.languages.filter(Boolean).join(', ')}

Generate a professional, well-formatted CV in plain text. Include all sections: Personal Info, Professional Summary, Work Experience, Education, Technical Skills, and Programming Languages. Make it clean and readable.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const cvText = aiData.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ cvText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('generate-cv error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'CV generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
