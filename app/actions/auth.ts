"use server"

import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(email: string, password: string, username: string) {
  try {
    const adminSupabase = await getSupabaseAdminClient()

    // Create auth user
    const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (signUpError) {
      console.error("[auth] admin.createUser error:", signUpError)
      try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'admin.createUser', signUpError) } catch {}
      return { error: "Could not create user. Please try again." }
    }

    // Create profile using the admin (service role) client so the insert bypasses RLS.
    // The profiles table has an INSERT policy that requires auth.uid() = id —
    // the newly-created user isn't signed in yet, so the anon/server client would be blocked.
    if (authData.user) {
      const { error: profileError } = await adminSupabase.from("profiles").insert({
        id: authData.user.id,
        email,
        username: username || email.split("@")[0],
      })

      if (profileError) {
        console.error("[auth] creating profile error:", profileError)
        try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'create profile', profileError) } catch {}
        return { error: "Could not create user profile. Please try again." }
      }

      // Get a server client (anon) to sign the user in after the admin-created account exists
      const supabase = await getSupabaseServerClient()

      // Sign the user in using the server Supabase client
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("[auth] signInWithPassword error:", signInError)
        try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'signInWithPassword', signInError) } catch {}
        return { error: "Could not sign in. Please try again." }
      }
    }

    redirect("/dashboard")
  } catch (err: any) {
    console.error("[auth] signUp exception:", err)
    try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'signUp exception', err) } catch {}
    return { error: "An unexpected error occurred during signup" }
  }
}

export async function login(email: string, password: string) {
  try {
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[auth] signInWithPassword error:", error)
      try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'login.signInWithPassword', error) } catch {}
      return { error: "Could not sign in. Please try again." }
    }

    redirect("/dashboard")
  } catch (err: any) {
    console.error("[auth] login exception:", err)
    try { const { addDevLog } = await import('@/lib/dev/logs'); addDevLog('error', 'login exception', err) } catch {}
    return { error: "An unexpected error occurred during login" }
  }
}
