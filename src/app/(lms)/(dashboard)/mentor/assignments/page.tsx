import { getMentorSubmissions } from "./actions"
import AssignmentsClient from "./assignments-client"

export const dynamic = "force-dynamic"

export default async function MentorAssignmentsPage() {
  const submissions = await getMentorSubmissions()

  return <AssignmentsClient initialSubmissions={submissions} />
}
