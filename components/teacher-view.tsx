'use client'

import { BookOpen, ClipboardCheck, Inbox, Users } from 'lucide-react'
import { GROUPS, STUDENTS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryTag, StatusBadge } from '@/components/status-badge'
import { StatCard } from '@/components/stat-card'
import { NewTaskDialog } from '@/components/new-task-dialog'
import { ReviewList } from '@/components/review-list'

export function TeacherView() {
  const { tasks, reservations, pointsFor } = useStore()
  const pending = reservations.filter((r) => r.status === 'entregada')
  const maxPoints = tasks.reduce((s, t) => s + t.points, 0)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-semibold">Panel del profesor</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Cargá mecánicas, revisá entregas y seguí el progreso de cada grupo.
        </p>
      </section>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Mecánicas cargadas" value={tasks.length} Icon={BookOpen} />
        <StatCard label="Por revisar" value={pending.length} Icon={Inbox} />
        <StatCard label="Aprobadas" value={reservations.filter((r) => r.status === 'aprobada').length} Icon={ClipboardCheck} />
        <StatCard label="Estudiantes" value={STUDENTS.length} Icon={Users} />
      </section>

      <Tabs defaultValue="tareas">
        <TabsList>
          <TabsTrigger value="tareas">Tabla de tareas</TabsTrigger>
          <TabsTrigger value="revision">
            Revisión
            {pending.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="progreso">Progreso</TabsTrigger>
        </TabsList>

        <TabsContent value="tareas" className="mt-3 flex flex-col gap-3">
          <div className="flex justify-end">
            <NewTaskDialog />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Mecánica</th>
                  <th className="px-4 py-2.5 font-medium">Categoría</th>
                  <th className="px-4 py-2.5 font-medium">Requiere</th>
                  <th className="px-4 py-2.5 text-right font-medium">Puntos</th>
                  {GROUPS.map((g) => (
                    <th key={g.id} className="px-4 py-2.5 font-medium">
                      {g.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 font-mono text-xs text-muted-foreground">{task.code}</span>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.requirements.length} requisitos</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryTag>{task.category}</CategoryTag>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {task.prerequisites.map((id) => tasks.find((t) => t.id === id)?.code).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{task.points}</td>
                    {GROUPS.map((g) => {
                      const r = reservations.find((x) => x.taskId === task.id && x.groupId === g.id)
                      return (
                        <td key={g.id} className="px-4 py-3">
                          {r ? (
                            <div className="flex flex-col gap-1">
                              <StatusBadge state={r.status} />
                              <span className="text-xs text-muted-foreground">
                                {STUDENTS.find((s) => s.id === r.studentId)?.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin reservar</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="revision" className="mt-3">
          <ReviewList />
        </TabsContent>

        <TabsContent value="progreso" className="mt-3">
          <div className="grid gap-4 md:grid-cols-3">
            {GROUPS.map((g) => {
              const groupPoints = pointsFor((r) => r.groupId === g.id)
              const pct = Math.round((groupPoints / maxPoints) * 100)
              return (
                <article key={g.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{g.name}</h3>
                      <p className="text-xs text-muted-foreground">{g.game}</p>
                    </div>
                    <p className="text-right">
                      <span className="text-xl font-semibold">{groupPoints}</span>
                      <span className="text-xs text-muted-foreground"> / {maxPoints} pts</span>
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso ${g.name}`}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <ul className="flex flex-col divide-y divide-border">
                    {STUDENTS.filter((s) => s.groupId === g.id).map((s) => {
                      const mine = reservations.filter((r) => r.studentId === s.id)
                      return (
                        <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                          <div>
                            <p>{s.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {mine.filter((r) => r.status === 'aprobada').length} aprobadas ·{' '}
                              {mine.filter((r) => r.status !== 'aprobada').length} en proceso
                            </p>
                          </div>
                          <span className="font-semibold tabular-nums">{pointsFor((r) => r.studentId === s.id)} pts</span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
