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
      return { error: signUpError.message }
    }

    const supabase = await getSupabaseServerClient()

    // Create profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        username: username || email.split("@")[0],
      })

      if (profileError) {
        return { error: profileError.message }
      }

      const { error: signInError } = await adminSupabase.auth.admin.createSession({
        user_id: authData.user.id,
      })

      if (signInError) {
        return { error: signInError.message }
      }
    }

    redirect("/dashboard")
  } catch (err: any) {
    return { error: err.message || "An error occurred during signup" }
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
      return { error: error.message }
    }

    redirect("/dashboard")
  } catch (err: any) {
    return { error: err.message || "An error occurred during login" }
  }
}
