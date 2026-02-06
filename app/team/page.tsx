import { db, initDB } from '@/lib/db'
import { teamMembers, roles, engines } from '@/lib/db/schema'
import { TeamView } from '@/components/team/team-view'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  initDB()
  const [members, roleList, engineList] = await Promise.all([
    db.select().from(teamMembers).orderBy(teamMembers.name),
    db.select().from(roles).orderBy(roles.name),
    db.select().from(engines),
  ])

  return <TeamView members={members} roles={roleList} engines={engineList} />
}
