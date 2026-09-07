import { createBrowserClient } from "@supabase/ssr";

// Not generic over our hand-written Database type: supabase-js's generic
// inference needs Views/Functions/Enums keys we don't maintain, and gets
// `never` on every table otherwise. Domain types in database.types.ts are
// applied at the call sites instead.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
