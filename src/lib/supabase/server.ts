import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

// See client.ts for why this isn't generic over our Database type.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no request context to write to.
            // Safe to ignore because middleware refreshes the session on every request.
          }
        },
      },
    },
  );
}

// auth.getUser() round-trips to Supabase to validate the JWT. The layout and
// every query it fans out to (in parallel, per page) used to each call it
// separately — up to 8 network calls for one tab switch. React's cache()
// dedupes it to one call per request.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
