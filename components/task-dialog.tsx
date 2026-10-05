'use client'

import { useState } from 'react'
import { Lock, MessageSquare } from 'lucide-react'
import { STUDENTS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CategoryTag, StatusBadge } from '@/components/status-badge'

export function TaskDialog({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { tasks, currentStudentId, getTaskState, dispatch } = useStore()
  const [confirming, setConfirming] = useState(false)
  const task = tasks.find((t) => t.id === taskId)
  const info = task ? getTaskState(task, currentStudentId) : null
  const res = info?.reservation
  const isMine = res && res.studentId === currentStudentId
  const editable = isMine && (info.state === 'reservada' || info.state === 'rechazada')
  const done = res?.checklist.filter(Boolean).length ?? 0

  const close = () => {
    setConfirming(false)
    onClose()
  }

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {task && info && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{task.code}</span>
                <CategoryTag>{task.category}</CategoryTag>
                <StatusBadge state={info.state} />
              </div>
              <DialogTitle className="text-lg">{task.title}</DialogTitle>
              <DialogDescription className="text-pretty">{task.description}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Puntos al aprobar</span>
              <span className="font-semibold">{task.points}</span>
            </div>

            {info.state === 'bloqueada' && (
              <p className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Tu grupo primero tiene que aprobar:{' '}
                {task.prerequisites.map((id) => tasks.find((t) => t.id === id)?.title).join(', ')}.
              </p>
            )}

            {info.state === 'tomada' && res && (
              <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                Esta mecánica la está haciendo {STUDENTS.find((s) => s.id === res.studentId)?.name} de tu grupo.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Requisitos a cumplir</h3>
                {isMine && (
                  <span className="text-xs text-muted-foreground">
                    {done}/{task.requirements.length}
                  </span>
                )}
              </div>
              {isMine && (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(done / task.requirements.length) * 100}%` }}
                  />
                </div>
              )}
              <ul className="flex flex-col gap-1.5">
                {task.requirements.map((req, i) => {
                  const checked = !!res?.checklist[i] && !!isMine
                  return (
                    <li key={req}>
                      <label
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm',
                          editable && 'cursor-pointer hover:bg-muted/50',
                          checked && 'text-muted-foreground line-through',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!editable}
                          onCheckedChange={() =>
                            res && dispatch({ type: 'toggleCheck', reservationId: res.id, index: i })
                          }
                        />
                        {req}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>

            {isMine && res.feedback && (
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium">Comentario del profesor</p>
                  <p className="text-muted-foreground">{res.feedback}</p>
                </div>
              </div>
            )}

            {isMine && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="note" className="text-sm font-medium">
                  Notas de avance
                </label>
                <Textarea
                  id="note"
                  value={res.note}
                  disabled={!editable}
                  onChange={(e) => dispatch({ type: 'setNote', reservationId: res.id, note: e.target.value })}
                  placeholder="Ej: hoy terminé el movimiento, mañana pruebo con A/D."
                  rows={3}
                />
              </div>
            )}

            {editable && confirming && (
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Autoevaluación: ¿tu mecánica cumple lo que pide el ejercicio?</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'submit', reservationId: res.id, selfAssessment: 'cumple' })
                      setConfirming(false)
                    }}
                  >
                    Sí, cumple todo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      dispatch({ type: 'submit', reservationId: res.id, selfAssessment: 'parcial' })
                      setConfirming(false)
                    }}
                  >
                    Cumple en parte
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              {info.state === 'disponible' && (
                <Button onClick={() => dispatch({ type: 'reserve', taskId: task.id })}>Reservar mecánica</Button>
              )}
              {editable && info.state === 'reservada' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    dispatch({ type: 'cancel', reservationId: res.id })
                  }}
                >
                  Liberar reserva
                </Button>
              )}
              {editable && !confirming && (
                <Button onClick={() => setConfirming(true)} disabled={done === 0}>
                  Entregar para revisión
                </Button>
              )}
              {info.state === 'entregada' && (
                <p className="text-sm text-muted-foreground">Entregada. Esperando revisión del profesor.</p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
