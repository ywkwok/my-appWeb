import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — reads config from build-time env vars.
 *
 * IMPORTANT (GitHub Pages = static hosting):
 * We can't use runtime process.env on the static export, so the values are
 * inlined at build time. The public anon key is safe to ship to the browser;
 * never put the service_role key here.
 */
const supabaseUrl: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://qydifhepwqstixielsjl.supabase.co";

const supabaseAnonKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_245-zA-SN4OIkpaQ4flS-g_XAkl5o4O";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
