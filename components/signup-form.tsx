"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUpWithEmail, signInWithGoogle } from "@/lib/supabase/actions"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setError("Adgangskoderne matcher ikke")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Adgangskoden skal være mindst 8 tegn")
      setLoading(false)
      return
    }

    const result = await signUpWithEmail(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-left gap-1 text-left">
          <h1 className="text-2xl font-bold">Opret din konto</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Udfyld formularen nedenfor for at oprette din konto
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Fulde navn</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Anders Andersen"
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="din@email.dk"
            required
            disabled={loading}
          />
          <FieldDescription>
            Vi bruger din email til at kontakte dig. Vi deler den ikke med andre.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Adgangskode</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={loading}
          />
          <FieldDescription>
            Skal være mindst 8 tegn.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Bekræft adgangskode</FieldLabel>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Opretter konto..." : "Opret konto"}
          </Button>
        </Field>
        <FieldSeparator>Eller fortsæt med</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Opret med Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Har du allerede en konto?{" "}
            <a href="/login" className="underline underline-offset-4">
              Log ind
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
