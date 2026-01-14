import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mazsobuocswsabkbfqhe.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_8IcdApGjvKJx4vfGfewOIQ_6gH-OGL_";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
