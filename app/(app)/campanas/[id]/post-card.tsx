'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Post } from '@/lib/types'
import { FORMATO_LABEL, FORMATO_COLOR } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, CheckCircle, Globe } from 'lucide-react'

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateEstado = async (estado: Post['estado']) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .update({ estado })
      .eq('id', post.id)
    if (error) {
      toast.error('No se pudo actualizar el estado.')
    } else {
      toast.success('Estado actualizado.')
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
      toast.error('No se pudo eliminar el post.')
    } else {
      toast.success('Post eliminado.')
      router.refresh()
    }
    setIsLoading(false)
  }

  const fecha = new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.formato && (
              <Badge
                variant="outline"
                className={`text-xs ${FORMATO_COLOR[post.formato]}`}
              >
                {FORMATO_LABEL[post.formato]}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{fecha}</span>
            {post.hora && (
              <span className="text-xs text-muted-foreground">{post.hora.slice(0, 5)}</span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0 -mr-1.5 -mt-0.5">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {post.estado === 'borrador' && (
                <DropdownMenuItem onClick={() => updateEstado('aprobado')} disabled={isLoading}>
                  <CheckCircle className="mr-2 size-4" />
                  Aprobar
                </DropdownMenuItem>
              )}
              {post.estado === 'aprobado' && (
                <DropdownMenuItem onClick={() => updateEstado('publicado')} disabled={isLoading}>
                  <Globe className="mr-2 size-4" />
                  Marcar publicado
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {post.texto ? (
          <p className="line-clamp-4 text-sm leading-relaxed">{post.texto}</p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">Sin texto todavía.</p>
        )}
      </CardContent>
      {post.media_url && (
        <CardFooter className="pt-0 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.media_url}
            alt="Media del post"
            className="w-full rounded-md object-cover max-h-40"
          />
        </CardFooter>
      )}
    </Card>
  )
}
