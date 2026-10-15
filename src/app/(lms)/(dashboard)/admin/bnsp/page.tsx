import { getAdminBnspBatches } from "@/lib/bnsp.server"
import { BnspAssessmentManager } from "@/components/bnsp/BnspAssessmentManager"

export const dynamic = "force-dynamic"

export default async function AdminBnspPage() {
  const batches = await getAdminBnspBatches()

  return <BnspAssessmentManager initialBatches={batches} role="admin" />
}
