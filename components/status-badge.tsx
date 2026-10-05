import { CheckCircle2, Circle, Clock, Lock, RotateCcw, Send, Users } from 'lucide-react'
import { STATE_LABEL, type TaskState } from '@/lib/data'
import { cn } from '@/lib/utils'

const STYLES: Record<TaskState, { className: string; Icon: typeof Circle }> = {
  disponible: { className: 'bg-primary/10 text-primary', Icon: Circle },
  bloqueada: { className: 'bg-muted text-muted-foreground', Icon: Lock },
  tomada: { className: 'bg-muted text-muted-foreground', Icon: Users },
  reservada: { className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', Icon: Clock },
  entregada: { className: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300', Icon: Send },
  aprobada: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300', Icon: CheckCircle2 },
  rechazada: { className: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300', Icon: RotateCcw },
}

export function StatusBadge({ state, className }: { state: TaskState; className?: string }) {
  const { className: style, Icon } = STYLES[state]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {STATE_LABEL[state]}
    </span>
  )
}

export function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  )
}
