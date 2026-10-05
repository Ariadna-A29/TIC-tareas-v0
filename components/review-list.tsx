'use client'

import { useState } from 'react'
import { Check, Inbox, X } from 'lucide-react'
import { GROUPS, STUDENTS, type Reservation } from '@/lib/data'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ReviewCard({ reservation }: { reservation: Reservation }) {
  const { tasks, dispatch } = useStore()
  const [feedback, setFeedback] = useState('')
  const task = tasks.find((t) => t.id === reservation.taskId)!
  const student = STUDENTS.find((s) => s.id === reservation.studentId)!
  const group = GROUPS.find((g) => g.id === reservation.groupId)!

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{task.code}</p>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-xs text-muted-foreground">
            {student.name} · {group.name}
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
          Autoevaluación: {reservation.selfAssessment === 'cumple' ? 'cumple todo' : 'cumple en parte'}
        </span>
      </div>

      <ul className="flex flex-col gap-1 text-sm">
        {task.requirements.map((req, i) => (
          <li key={req} className="flex items-center gap-2">
            {reservation.checklist[i] ? (
              <Check className="size-4 text-emerald-600" aria-label="Cumplido" />
            ) : (
              <X className="size-4 text-rose-600" aria-label="No cumplido" />
            )}
            {req}
          </li>
        ))}
      </ul>

      {reservation.note && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{`"${reservation.note}"`}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Comentario para el estudiante (opcional)"
          aria-label="Comentario"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'review', reservationId: reservation.id, approved: false, feedback })}
          >
            Pedir cambios
          </Button>
          <Button
            onClick={() => dispatch({ type: 'review', reservationId: reservation.id, approved: true, feedback })}
          >
            Aprobar +{task.points}
          </Button>
        </div>
      </div>
    </article>
  )
}

export function ReviewList() {
  const { reservations } = useStore()
  const pending = reservations.filter((r) => r.status === 'entregada')

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">No hay entregas pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pending.map((r) => (
        <ReviewCard key={r.id} reservation={r} />
      ))}
    </div>
  )
}
