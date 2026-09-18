import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getGamificationSummary } from "@/lib/queries";
import { BADGES } from "@/lib/gamification";
import { getTodaysTip } from "@/lib/tips";
import { BottomNav } from "@/components/BottomNav";
import { TopBar } from "@/components/TopBar";
import { CelebrationModal } from "@/components/CelebrationModal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ data: profile }, gamification] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded, full_name, bloating_prone, osteopenia_risk, pcos")
      .eq("id", user.id)
      .single(),
    getGamificationSummary(),
  ]);
  if (!profile?.onboarded) redirect("/onboarding");

  const badges = (gamification?.newlyEarned ?? [])
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b) => b != null)
    .map((b) => ({ icon: b.icon, title: b.title, description: b.description }));

  const tip = getTodaysTip({
    bloatingProne: profile.bloating_prone,
    osteopeniaRisk: profile.osteopenia_risk,
    pcos: profile.pcos,
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar name={profile.full_name} state={gamification?.state ?? null} />
      <main className="flex-1 px-4 pt-4 pb-24 max-w-lg w-full mx-auto">{children}</main>
      <BottomNav />
      {gamification && (
        <CelebrationModal badges={badges} leveledUpTo={gamification.leveledUpTo} tip={tip} />
      )}
    </div>
  );
}
