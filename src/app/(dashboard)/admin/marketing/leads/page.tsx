import { getMarketingLeads } from "../leads-actions"
import { getActiveMarketingPrograms } from "../program-actions"
import LeadsClientPage from "./LeadsClientPage"

export const revalidate = 0;

export default async function MarketingLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
  const program = typeof resolvedParams.program === 'string' ? resolvedParams.program : undefined;

  const [leads, programs] = await Promise.all([
    getMarketingLeads({ status, program }),
    getActiveMarketingPrograms(),
  ])

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lead CRM</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Kelola data calon siswa (leads) yang mendaftar dari halaman marketing web.
          </p>
        </div>
      </div>

      <LeadsClientPage leads={leads} programs={programs} currentStatus={status} currentProgram={program} />
    </div>
  )
}
