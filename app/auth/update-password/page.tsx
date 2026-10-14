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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Se llega acá desde el link del mail de recuperación: /auth/callback ya canjeó el código por
// una sesión, así que solo falta guardar la contraseña nueva para el usuario logueado.
export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // null = verificando; false = sin sesión (el link venció, ya se usó o se abrió en otro navegador)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setHasSession(!!user))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Listo, actualizamos tu contraseña')
      router.push('/')
      router.refresh()
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al actualizar la contraseña',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (hasSession === false) {
    return (
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">El link ya no sirve</CardTitle>
            <CardDescription>
              Puede que haya vencido, que ya lo hayas usado o que lo hayas abierto en otro
              navegador. Pedí uno nuevo y abrilo en este navegador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/auth/forgot-password"
              className={buttonVariants({ className: 'w-full' })}
            >
              Pedir un link nuevo
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
          <CardTitle className="text-xl">Elegí una contraseña nueva</CardTitle>
          <CardDescription>
            La vas a usar la próxima vez que inicies sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña nueva</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeat-password">Repetir contraseña</Label>
              <Input
                id="repeat-password"
                name="repeat-password"
                type="password"
                autoComplete="new-password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
