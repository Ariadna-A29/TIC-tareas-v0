'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CATEGORIES, type Category } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function NewTaskDialog() {
  const { tasks, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [points, setPoints] = useState(10)
  const [category, setCategory] = useState<Category>('Movimiento')
  const [prerequisites, setPrerequisites] = useState<string[]>([])

  const reqList = requirements.split('\n').map((r) => r.trim()).filter(Boolean)
  const valid = title.trim() && summary.trim() && reqList.length > 0 && points > 0

  const reset = () => {
    setTitle('')
    setSummary('')
    setDescription('')
    setRequirements('')
    setPoints(10)
    setCategory('Movimiento')
    setPrerequisites([])
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    dispatch({
      type: 'addTask',
      task: {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim() || summary.trim(),
        requirements: reqList,
        prerequisites,
        points: Math.min(100, Math.round(points)),
        category,
      },
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" aria-hidden="true" />
        Nueva mecánica
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva mecánica</DialogTitle>
          <DialogDescription>Usá frases simples para que los estudiantes entiendan qué hay que hacer.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Nombre</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Doble salto" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary">Explicación en una frase</Label>
            <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Ej: El personaje puede saltar otra vez en el aire." required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={3}
              placeholder={'Salta dos veces\nNo salta una tercera vez'}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="points">Puntos</Label>
              <Input id="points" type="number" min={1} max={100} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            </div>
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium">Tareas requisito</legend>
            <div className="flex flex-wrap gap-1.5">
              {tasks.map((t) => {
                const active = prerequisites.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setPrerequisites((p) => (active ? p.filter((x) => x !== t.id) : [...p, t.id]))
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t.code} {t.title}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid}>
              Agregar a la tabla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
