import { createClient } from "@/utils/supabase/server"

export async function getMarketingSession() {
  let isLoggedIn = false
  let purchasedProgramId: string | undefined = undefined
  let purchasedTier: string | undefined = undefined
  let role: string | null = null

  let hasLmsAccess = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      isLoggedIn = true
      
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData) {
        role = userData.role
      }

      if (role === 'admin' || role === 'super_admin' || role === 'mentor') {
        hasLmsAccess = true;
      }

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("batches(program_id, programs(id, name))")
        .eq("user_id", user.id)
        .eq("status", "aktif")
        .limit(1)
        .single()
        
      if (enrollment) {
        const batch = (enrollment as any).batches
        const program = batch?.programs
        if (program?.id) {
          purchasedProgramId = program.id
          purchasedTier = "bootcamp"
          hasLmsAccess = true;
        }
      }

      // If no enrollment, check video_access for junior/expert
      if (!purchasedProgramId) {
        const { data: videoAccess } = await supabase
          .from("video_access")
          .select("program_id, tier")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .single()
          
        if (videoAccess) {
          purchasedProgramId = videoAccess.program_id
          purchasedTier = videoAccess.tier
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user session in marketing:", error)
  }

  return { isLoggedIn, purchasedProgramId, purchasedTier, role, hasLmsAccess }
}
