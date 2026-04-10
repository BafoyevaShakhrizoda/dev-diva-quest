const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  title?: string;
  description?: string;
  url?: string;
  markdown?: string;
}

async function firecrawlSearch(query: string, apiKey: string, limit = 5): Promise<SearchResult[]> {
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit, lang: 'en', scrapeOptions: { formats: ['markdown'] } }),
    });
    const data = await res.json();
    return data?.data || [];
  } catch {
    return [];
  }
}

function buildContext(sections: Record<string, SearchResult[]>): string {
  let ctx = '';
  for (const [label, results] of Object.entries(sections)) {
    ctx += `\n### ${label}\n`;
    for (const r of results) {
      ctx += `- **${r.title || 'Untitled'}** (${r.url || ''})\n`;
      if (r.description) ctx += `  ${r.description}\n`;
      if (r.markdown) ctx += `  ${r.markdown.slice(0, 1500)}\n`;
    }
  }
  return ctx;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const { company } = await req.json();
        if (!company) {
          send('error', { message: 'Company name is required' });
          controller.close();
          return;
        }

        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        const lovableKey = Deno.env.get('LOVABLE_API_KEY');

        if (!firecrawlKey || !lovableKey) {
          send('error', { message: 'API keys not configured' });
          controller.close();
          return;
        }

        // Step 1: Search for company overview
        send('step', { step: 'Searching for company overview...', progress: 10 });
        const overview = await firecrawlSearch(`${company} company overview about`, firecrawlKey);

        // Step 2: Search for recent news & funding
        send('step', { step: 'Searching for recent news & funding...', progress: 30 });
        const news = await firecrawlSearch(`${company} latest news funding 2024 2025`, firecrawlKey);

        // Step 3: Search for products & features
        send('step', { step: 'Analyzing products & features...', progress: 50 });
        const products = await firecrawlSearch(`${company} key products features pricing`, firecrawlKey);

        // Step 4: Search for market position & competitors
        send('step', { step: 'Researching market position...', progress: 70 });
        const market = await firecrawlSearch(`${company} market position competitors strengths weaknesses`, firecrawlKey);

        // Step 5: Synthesize with AI
        send('step', { step: 'Synthesizing competitive intelligence report...', progress: 85 });

        const context = buildContext({
          'Company Overview': overview,
          'Recent News & Funding': news,
          'Products & Features': products,
          'Market Position & Competitors': market,
        });

        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a competitive intelligence analyst. Generate a structured competitor analysis report in valid JSON format with these exact keys:
{
  "companyName": "string",
  "summary": "One paragraph executive summary",
  "overview": {
    "founded": "string or null",
    "headquarters": "string or null",
    "employees": "string or null",
    "funding": "string or null",
    "valuation": "string or null",
    "description": "string"
  },
  "recentNews": [{"headline": "string", "detail": "string"}],
  "products": [{"name": "string", "description": "string"}],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "marketPosition": "string paragraph",
  "competitors": ["string"]
}
Be factual. If you don't know something, use null. Use real data from the provided search results.`,
              },
              {
                role: 'user',
                content: `Analyze "${company}" based on these search results:\n${context}`,
              },
            ],
          }),
        });

        const aiData = await aiRes.json();
        let reportText = aiData?.choices?.[0]?.message?.content || '';

        // Strip markdown code fences if present
        reportText = reportText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let report;
        try {
          report = JSON.parse(reportText);
        } catch {
          report = { raw: reportText, parseError: true };
        }

        send('step', { step: 'Report complete!', progress: 100 });
        send('report', report);
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});
