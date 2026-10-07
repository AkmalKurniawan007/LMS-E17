import { getMentorSubmissions } from "./actions"
import ProjectsClient from "./projects-client"

export const dynamic = "force-dynamic"

export default async function MentorProjectsPage() {
  const submissions = await getMentorSubmissions()

  return <ProjectsClient initialSubmissions={submissions} />
}
