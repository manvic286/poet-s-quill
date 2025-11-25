"use client"

import { useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Poet's Quill</h1>
          <p className="text-muted-foreground">Write, share, and celebrate your poems</p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          {isLogin ? (
            <>
              <LoginForm />
              <p className="text-center text-foreground mt-6 text-sm">
                Don&apos;t have an account?{" "}
                <button onClick={() => setIsLogin(false)} className="text-primary hover:underline font-semibold">
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <SignupForm />
              <p className="text-center text-foreground mt-6 text-sm">
                Already have an account?{" "}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:underline font-semibold">
                  Login
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">Your poems, your stories, your voice.</p>
      </div>
    </div>
  )
}
