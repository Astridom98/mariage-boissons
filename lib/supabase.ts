import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
