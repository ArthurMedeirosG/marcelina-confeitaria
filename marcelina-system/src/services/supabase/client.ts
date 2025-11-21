import { createClient } from "@supabase/supabase-js";

function assertEnv(value: string | undefined, variable: string): string {
  if (!value) {
    throw new Error(`Variável de ambiente ${variable} não definida.`);
  }

  return value;
}

const supabaseUrl = assertEnv(import.meta.env.VITE_SUPABASE_URL, "VITE_SUPABASE_URL");
const supabaseAnonKey = assertEnv(import.meta.env.VITE_SUPABASE_ANON_KEY, "VITE_SUPABASE_ANON_KEY");

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
