'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Search, Sparkles, Trophy } from 'lucide-react'
import { GROUPS, STUDENTS, type TaskState } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryTag, StatusBadge } from '@/components/status-badge'
import { StatCard } from '@/components/stat-card'
import { TaskDialog } from '@/components/task-dialog'

const FILTERS: { value: 'todas' | TaskState; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'disponible', label: 'Disponibles' },
  { value: 'reservada', label: 'En curso' },
  { value: 'entregada', label: 'Entregadas' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Para corregir' },
]

export function StudentView() {
  const { tasks, currentStudentId, getTaskState, pointsFor, dispatch } = useStore()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('todas')
  const [query, setQuery] = useState('')
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)

  const student = STUDENTS.find((s) => s.id === currentStudentId)!
  const group = GROUPS.find((g) => g.id === student.groupId)!
  const rows = tasks.map((task) => ({ task, ...getTaskState(task, currentStudentId) }))
  const count = (s: TaskState) => rows.filter((r) => r.state === s).length

  const visible = rows.filter(
    (r) =>
      (filter === 'todas' || r.state === filter) &&
      (r.task.title + r.task.summary + r.task.code).toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold">Hola, {student.name.split(' ')[0]}</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          {group.name} · {group.game}. Elegí una mecánica disponible, reservala y marcá cada requisito a medida que avanzás.
        </p>
      </section>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Puntos obtenidos" value={pointsFor((r) => r.studentId === student.id)} Icon={Trophy} />
        <StatCard label="Aprobadas" value={count('aprobada')} Icon={CheckCircle2} />
        <StatCard label="En curso" value={count('reservada') + count('rechazada')} Icon={Clock} />
        <StatCard label="Disponibles" value={count('disponible')} Icon={Sparkles} />
      </section>

      <section aria-label="Tabla de tareas" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === f.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative md:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar mecánica..."
              aria-label="Buscar mecánica"
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Mecánica</th>
                <th className="px-4 py-2.5 font-medium">Categoría</th>
                <th className="px-4 py-2.5 font-medium">Requiere</th>
                <th className="px-4 py-2.5 text-right font-medium">Puntos</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Acción</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ task, state, reservation }) => {
                const prereqs = task.prerequisites.map((id) => tasks.find((t) => t.id === id)?.code).filter(Boolean)
                const done = reservation?.checklist.filter(Boolean).length ?? 0
                return (
                  <tr
                    key={task.id}
                    onClick={() => setOpenTaskId(task.id)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-xs text-muted-foreground">{task.code}</span>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.summary}</p>
                          {(state === 'reservada' || state === 'rechazada') && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Avance: {done}/{task.requirements.length} requisitos
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryTag>{task.category}</CategoryTag>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {prereqs.length ? prereqs.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{task.points}</td>
                    <td className="px-4 py-3">
                      <StatusBadge state={state} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {state === 'disponible' ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch({ type: 'reserve', taskId: task.id })
                            setOpenTaskId(task.id)
                          }}
                        >
                          Reservar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          {state === 'reservada' || state === 'rechazada' ? 'Continuar' : 'Ver'}
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No hay mecánicas con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <TaskDialog taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </div>
  )
}
