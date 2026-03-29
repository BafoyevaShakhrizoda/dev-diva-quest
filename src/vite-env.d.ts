/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_API_BASE_URL?: string
  /** Optional: Django origin if API base is non-standard (defaults to stripping /api from VITE_API_BASE_URL) */
  readonly VITE_DJANGO_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
