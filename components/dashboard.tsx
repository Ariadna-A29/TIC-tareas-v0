'use client'

import { StoreProvider, useStore } from '@/lib/store'
import { AppHeader } from '@/components/app-header'
import { StudentView } from '@/components/student-view'
import { TeacherView } from '@/components/teacher-view'

function Content() {
  const { role } = useStore()
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      {role === 'estudiante' ? <StudentView /> : <TeacherView />}
    </main>
  )
}

export function Dashboard() {
  return (
    <StoreProvider>
      <div className="flex min-h-svh flex-col bg-background">
        <AppHeader />
        <Content />
      </div>
    </StoreProvider>
  )
}
