"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CollegeRegistrationForm } from "@/components/college-registration-form"

interface LoginResponse {
  success: boolean
  message?: string
  error?: string
  user: {
    id: string
    name: string
    email: string
    role: string
    college?: {
      name: string
      shortName: string
    }
    studentProfile?: unknown
    facultyProfile?: unknown
  }
  token: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [authView, setAuthView] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const goToRegister = () => {
    setError("")
    setAuthView("register")
  }

  const goToLogin = () => {
    setAuthView("login")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        switch (data.user.role) {
          case "student":
            router.push("/student")
            break
          case "faculty":
            router.push("/faculty")
            break
          case "admin":
          case "super_admin":
          case "cashier":
            router.push("/admin")
            break
          default:
            router.push("/")
        }
      } else {
        setError(data.message || data.error || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authView === "register") {
    return (
      <div className={cn("w-full", className)}>
        <CollegeRegistrationForm onBackToLogin={goToLogin} />
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email and password to continue.
        </p>
      </div>
      <div className="grid gap-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200/80 bg-red-50/90 p-3 text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-sm leading-snug">{error}</span>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show
                </>
              )}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>

      <div className="border-t border-border/70 pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Need to register a new college?{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-medium text-primary"
            onClick={goToRegister}
          >
            Register College
          </Button>
        </p>
      </div>
    </form>
  )
}
