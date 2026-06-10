import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Revisá tu email</CardTitle>
          <CardDescription>
            Te enviamos un correo de confirmación. Confirmá tu cuenta para poder
            empezar a usar YourMKT.
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
