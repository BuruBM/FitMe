import { getProfile } from "@/lib/queries";
import { signOut } from "@/lib/actions/auth";
import { ProfileTargets } from "@/components/ProfileTargets";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { CycleSettings } from "@/components/CycleSettings";
import { CitySettings } from "@/components/CitySettings";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Perfil</h1>
      <ProfileTargets profile={profile} />
      <CitySettings currentCity={profile.city} />
      <CycleSettings avgCycleLength={profile.avg_cycle_length} onBirthControl={profile.on_birth_control} />
      <RecommendationsPanel />
      <form action={signOut}>
        <button type="submit" className="w-full rounded-lg border border-card-border text-sm py-2.5 text-muted">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
