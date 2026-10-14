'use client'

import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // El link del mail pasa por /auth/callback (canjea el código por una sesión) y de ahí
      // sigue a /auth/update-password para elegir la contraseña nueva.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Ocurrió un error al enviar el email',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Revisá tu email</CardTitle>
            <CardDescription>
              Si hay una cuenta con{' '}
              <span className="break-all font-medium text-foreground">{email}</span>, te
              enviamos un link para elegir una contraseña nueva. Abrilo en este mismo
              navegador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login" className={buttonVariants({ className: 'w-full' })}>
              Volver a iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresá tu email y te mandamos un link para elegir una contraseña nueva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="nombre@empresa.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando…' : 'Enviar link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Te acordaste?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Iniciá sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
