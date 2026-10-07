import { redirect } from "next/navigation";
import { getMarketingSession } from "@/utils/marketing-auth";
import ClientPage from "./ClientPage";

export default async function ClassVideoPlayerPage({ params }: { params: Promise<{ programId: string }> }) {
  const unwrappedParams = await params;
  const programId = unwrappedParams.programId;
  const { isLoggedIn, purchasedProgramId, purchasedTier, role } = await getMarketingSession();

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    redirect("/pembeli/login?next=/kelas/" + programId);
  }

  // Admins always have access
  if (role === 'admin' || role === 'mentor') {
    return <ClientPage role={role} purchasedTier="bootcamp" />;
  }

  // Ensure they have purchased this program
  if (purchasedProgramId !== programId) {
    redirect("/");
  }

  return <ClientPage role={role} purchasedTier={purchasedTier} />;
}
