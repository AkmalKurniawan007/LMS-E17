import { createClient } from "@/utils/supabase/server"
import { ProgramsClient, type ProgramType } from "./programs-client"

export default async function AdminProgramsPage() {
  const supabase = await createClient()
  
  // Fetch programs along with batches and program_sessions to count them
  const { data, error } = await supabase
    .from('programs')
    .select(`
      id,
      name,
      description,
      is_active,
      batches ( id ),
      program_sessions ( id, title, description, order_number )
    `)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Error fetching programs:", error.message)
    // Could render an error state component here
  }
  
  let formattedPrograms: ProgramType[] = []
  
  if (data) {
    formattedPrograms = data.map((p: any) => ({
      id: p.id,
      title: p.name,
      description: p.description || "Program intensif yang mempersiapkan peserta menjadi profesional siap kerja.",
      active: p.is_active,
      sessions: p.program_sessions?.length || 0,
      program_sessions: (p.program_sessions || []).sort((a: any, b: any) => a.order_number - b.order_number),
      totalBatches: p.batches?.length || 0
    }))
  }

  return (
    <ProgramsClient initialPrograms={formattedPrograms} />
  )
}
