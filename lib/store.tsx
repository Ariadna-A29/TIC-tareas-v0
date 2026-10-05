'use client'

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import {
  INITIAL_RESERVATIONS,
  INITIAL_TASKS,
  STUDENTS,
  type Reservation,
  type Task,
  type TaskState,
} from './data'

type Role = 'estudiante' | 'profesor'

type State = {
  role: Role
  currentStudentId: string
  tasks: Task[]
  reservations: Reservation[]
}

type Action =
  | { type: 'setRole'; role: Role }
  | { type: 'setStudent'; studentId: string }
  | { type: 'reserve'; taskId: string }
  | { type: 'cancel'; reservationId: string }
  | { type: 'toggleCheck'; reservationId: string; index: number }
  | { type: 'setNote'; reservationId: string; note: string }
  | { type: 'submit'; reservationId: string; selfAssessment: 'cumple' | 'parcial' }
  | { type: 'review'; reservationId: string; approved: boolean; feedback: string }
  | { type: 'addTask'; task: Omit<Task, 'id' | 'code'> }

function updateReservation(state: State, id: string, patch: (r: Reservation) => Partial<Reservation>): State {
  return {
    ...state,
    reservations: state.reservations.map((r) =>
      r.id === id ? { ...r, ...patch(r), updatedAt: new Date().toISOString() } : r,
    ),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role }
    case 'setStudent':
      return { ...state, currentStudentId: action.studentId }
    case 'reserve': {
      const student = STUDENTS.find((s) => s.id === state.currentStudentId)
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!student || !task) return state
      const taken = state.reservations.some((r) => r.taskId === task.id && r.groupId === student.groupId)
      if (taken) return state
      return {
        ...state,
        reservations: [
          ...state.reservations,
          {
            id: crypto.randomUUID(),
            taskId: task.id,
            studentId: student.id,
            groupId: student.groupId,
            status: 'reservada',
            checklist: task.requirements.map(() => false),
            note: '',
            updatedAt: new Date().toISOString(),
          },
        ],
      }
    }
    case 'cancel':
      return { ...state, reservations: state.reservations.filter((r) => r.id !== action.reservationId) }
    case 'toggleCheck':
      return updateReservation(state, action.reservationId, (r) => ({
        checklist: r.checklist.map((c, i) => (i === action.index ? !c : c)),
      }))
    case 'setNote':
      return updateReservation(state, action.reservationId, () => ({ note: action.note }))
    case 'submit':
      return updateReservation(state, action.reservationId, () => ({
        status: 'entregada',
        selfAssessment: action.selfAssessment,
      }))
    case 'review':
      return updateReservation(state, action.reservationId, () => ({
        status: action.approved ? 'aprobada' : 'rechazada',
        feedback: action.feedback,
      }))
    case 'addTask': {
      const next = state.tasks.length + 1
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { ...action.task, id: crypto.randomUUID(), code: `M-${String(next).padStart(2, '0')}` },
        ],
      }
    }
  }
}

type Ctx = State & {
  dispatch: React.Dispatch<Action>
  getTaskState: (task: Task, studentId: string) => { state: TaskState; reservation?: Reservation }
  pointsFor: (filter: (r: Reservation) => boolean) => number
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    role: 'estudiante',
    currentStudentId: 's3',
    tasks: INITIAL_TASKS,
    reservations: INITIAL_RESERVATIONS,
  })

  const value = useMemo<Ctx>(() => {
    const getTaskState: Ctx['getTaskState'] = (task, studentId) => {
      const student = STUDENTS.find((s) => s.id === studentId)
      if (!student) return { state: 'bloqueada' }
      const groupRes = state.reservations.find((r) => r.taskId === task.id && r.groupId === student.groupId)
      if (groupRes) {
        return groupRes.studentId === studentId
          ? { state: groupRes.status, reservation: groupRes }
          : { state: 'tomada', reservation: groupRes }
      }
      const unlocked = task.prerequisites.every((pid) =>
        state.reservations.some((r) => r.taskId === pid && r.groupId === student.groupId && r.status === 'aprobada'),
      )
      return { state: unlocked ? 'disponible' : 'bloqueada' }
    }
    const pointsFor: Ctx['pointsFor'] = (filter) =>
      state.reservations
        .filter((r) => r.status === 'aprobada' && filter(r))
        .reduce((sum, r) => sum + (state.tasks.find((t) => t.id === r.taskId)?.points ?? 0), 0)
    return { ...state, dispatch, getTaskState, pointsFor }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
