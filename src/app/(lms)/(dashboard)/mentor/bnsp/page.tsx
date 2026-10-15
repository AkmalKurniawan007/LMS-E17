import { getMentorBnspBatches } from "@/lib/bnsp.server"
import { BnspAssessmentManager } from "@/components/bnsp/BnspAssessmentManager"

export const dynamic = "force-dynamic"

export default async function MentorBnspPage() {
  const batches = await getMentorBnspBatches()

  return <BnspAssessmentManager initialBatches={batches} role="mentor" />
}
