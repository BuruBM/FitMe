import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getGamificationSummary } from "@/lib/queries";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";
import { BadgeToast } from "@/components/BadgeToast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ data: profile }, gamification] = await Promise.all([
    supabase.from("profiles").select("onboarded, full_name").eq("id", user.id).single(),
    getGamificationSummary(),
  ]);
  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar name={profile.full_name} state={gamification?.state ?? null} />
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg w-full mx-auto">{children}</main>
      <BottomNav />
      {gamification && gamification.newlyEarned.length > 0 && (
        <BadgeToast badgeIds={gamification.newlyEarned} />
      )}
    </div>
  );
}
