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

    const links = [
      cv.github ? `GitHub: ${cv.github}` : '',
      cv.linkedin ? `LinkedIn: ${cv.linkedin}` : '',
      cv.telegram ? `Telegram: ${cv.telegram}` : '',
      cv.website ? `Website: ${cv.website}` : '',
    ].filter(Boolean).join(' | ');

    const prompt = `You are a professional CV writer specializing in IT careers. Create a polished, ATS-friendly CV styled like a real professional resume. Use clear section headings in UPPERCASE. Be professional and highlight uniqueness. Make the summary compelling and achievement-focused.

Candidate data:
Name: ${cv.name}
Role: ${cv.role}
Email: ${cv.email} | Phone: ${cv.phone} | Location: ${cv.location}
${links}

Summary: ${cv.summary}

Work Experience:
${cv.experience.map((e: any) => `- ${e.title} at ${e.company} (${e.duration}):\n  ${e.description}`).join('\n\n')}

Education:
${cv.education.map((e: any) => `- ${e.degree} at ${e.school} (${e.year})`).join('\n')}

Projects:
${(cv.projects || []).filter((p: any) => p.name).map((p: any) => `- ${p.name} [${p.tech}]: ${p.description}${p.link ? ` | ${p.link}` : ''}`).join('\n')}

Certifications:
${(cv.certifications || []).filter((c: any) => c.name).map((c: any) => `- ${c.name} — ${c.platform}${c.link ? ` (${c.link})` : ''}`).join('\n')}

Technical Skills: ${cv.skills.filter(Boolean).join(', ')}

Languages: ${(cv.spokenLanguages || cv.languages || []).filter((l: any) => typeof l === 'string' ? l : l.language).map((l: any) => typeof l === 'string' ? l : `${l.language} – ${l.level}`).join(' | ')}

Generate a complete, professional CV in plain text format with these sections in order:
1. Header (Name, Role, Contact, Links)
2. SUMMARY
3. WORK EXPERIENCE
4. EDUCATION
5. PROJECTS (if any)
6. CERTIFICATES (if any)
7. SKILLS AND INSTRUMENTS
8. LANGUAGES

Make it clean, readable, and ATS-friendly. Use bullet points with "-" for experience and project details.`;

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
