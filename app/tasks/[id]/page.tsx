import { db, initDB } from '@/lib/db'
import { tasks, taskComments, teamMembers, engines, milestones, projects } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { TaskDetail } from '@/components/tasks/task-detail'

export const dynamic = 'force-dynamic'

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  initDB()

  const task = await db.select().from(tasks).where(eq(tasks.id, Number(params.id))).limit(1)
  if (!task[0]) notFound()

  const [comments, members, engineList, milestoneList, projectList] = await Promise.all([
    db.select().from(taskComments).where(eq(taskComments.taskId, Number(params.id))).orderBy(desc(taskComments.createdAt)),
    db.select().from(teamMembers),
    db.select().from(engines),
    db.select().from(milestones),
    db.select().from(projects),
  ])

  return (
    <TaskDetail
      task={task[0]}
      comments={comments}
      members={members}
      engines={engineList}
      milestones={milestoneList}
      projects={projectList}
    />
  )
}
