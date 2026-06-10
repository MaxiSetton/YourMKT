import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Algo salió mal</CardTitle>
          <CardDescription>
            No pudimos completar la autenticación. Por favor, intentá de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">Volver a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
