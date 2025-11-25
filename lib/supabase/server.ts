import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  // Support both the server-side env names and the client-exposed NEXT_PUBLIC_* names.
  // In some deploy/runtime setups only SUPABASE_* or only NEXT_PUBLIC_SUPABASE_* may be set.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const err = new Error(
      "Supabase URL or Key is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment."
    )
    try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'missing supabase url/anon', { url: !!url, key: !!key }) } catch {}
    throw err
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware handling cookie updates.
        }
      },
    },
  })
}

export async function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    const err = new Error(
      "Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set in the environment."
    )
    try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'missing service role key', { url: !!url, serviceRole: !!serviceRole }) } catch {}
    throw err
  }

  return createServerClient(url, serviceRole, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // Admin client doesn't need to set cookies
      },
    },
  })
}
