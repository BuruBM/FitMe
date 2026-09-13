import { getProfile } from "@/lib/queries";
import { signOut } from "@/lib/actions/auth";
import { ProfileTargets } from "@/components/ProfileTargets";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { CycleSettings } from "@/components/CycleSettings";
import { CitySettings } from "@/components/CitySettings";
import { ManualTargets } from "@/components/ManualTargets";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Perfil</h1>
      <ProfileTargets profile={profile} />
      <ManualTargets
        calorieTarget={profile.calorie_target}
        proteinTargetG={profile.protein_target_g}
        carbTargetG={profile.carb_target_g}
        fatTargetG={profile.fat_target_g}
      />
      <CitySettings currentCity={profile.city} />
      <CycleSettings
        avgCycleLength={profile.avg_cycle_length}
        onBirthControl={profile.on_birth_control}
        pillStartedOn={profile.pill_started_on}
      />
      <RecommendationsPanel />
      <form action={signOut}>
        <button type="submit" className="w-full rounded-lg border border-card-border text-sm py-2.5 text-muted">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
