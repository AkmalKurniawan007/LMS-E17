import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ClientPage from "./ClientPage";

export default async function ClassVideoPlayerPage({ params }: { params: Promise<{ programId: string }> }) {
  const unwrappedParams = await params;
  const programId = unwrappedParams.programId;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/pembeli/login?next=/kelas/" + programId);
  }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  const role = userData?.role || null;

  // Admins & Mentors always have full access
  if (role === 'admin' || role === 'mentor' || role === 'super_admin') {
    return <ClientPage role={role} purchasedTier="bootcamp" />;
  }

  // 1. Cek tabel video_access (akses otomatis / manual)
  const { data: va } = await supabase
    .from("video_access")
    .select("tier, expires_at")
    .eq("user_id", user.id)
    .eq("program_id", programId)
    .eq("is_active", true)
    .maybeSingle();

  const isExpired = va?.expires_at ? new Date(va.expires_at) < new Date() : false;

  // 2. Cek tabel checkout_orders yang sudah dikonfirmasi / lunas
  const { data: co } = await supabase
    .from("checkout_orders")
    .select("tier_type")
    .eq("user_id", user.id)
    .eq("program_id", programId)
    .in("status", ["confirmed", "paid"])
    .maybeSingle();

  // 3. Cek apakah ada enrollment aktif (LMS batch)
  const { data: en } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "aktif")
    .limit(1);

  const hasAccess = (!isExpired && (!!va || !!co)) || (en && en.length > 0);

  // Jika belum memiliki akses atau sudah kedaluwarsa, arahkan ke halaman Kelas Saya
  if (!hasAccess) {
    redirect("/pembeli/kelas-saya");
  }

  const purchasedTier = va?.tier || co?.tier_type || "junior";
  return <ClientPage role={role} purchasedTier={purchasedTier} />;
}
