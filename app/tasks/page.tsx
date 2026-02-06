import { db, initDB } from '@/lib/db'
import { tasks, teamMembers, engines } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { TaskList } from '@/components/tasks/task-list'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  initDB()
  const [allTasks, members, engineList] = await Promise.all([
    db.select().from(tasks).orderBy(tasks.sortOrder, desc(tasks.createdAt)),
    db.select().from(teamMembers),
    db.select().from(engines),
  ])

  return (
    <TaskList
      tasks={allTasks}
      members={members}
      engines={engineList}
    />
  )
}
