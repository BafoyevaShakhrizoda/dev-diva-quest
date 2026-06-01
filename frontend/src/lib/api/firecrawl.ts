import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  tbs?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

export const firecrawlApi = {
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      };
    }
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
