'use client'

import { GraduationCap, LayoutList, UserRound } from 'lucide-react'
import { GROUPS, STUDENTS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { role, currentStudentId, dispatch } = useStore()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutList className="size-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">TIC Tareas</p>
            <p className="text-xs text-muted-foreground">Videojuegos — Tabla de tareas</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Rol" className="flex rounded-lg bg-muted p-1">
            {(
              [
                { value: 'estudiante', label: 'Estudiante', Icon: UserRound },
                { value: 'profesor', label: 'Profesor', Icon: GraduationCap },
              ] as const
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={role === value}
                onClick={() => dispatch({ type: 'setRole', role: value })}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  role === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {role === 'estudiante' && (
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">Estudiante</span>
              <select
                value={currentStudentId}
                onChange={(e) => dispatch({ type: 'setStudent', studentId: e.target.value })}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {GROUPS.map((g) => (
                  <optgroup key={g.id} label={g.name}>
                    {STUDENTS.filter((s) => s.groupId === g.id).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </header>
  )
}
