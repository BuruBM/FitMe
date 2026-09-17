import { redirect } from "next/navigation";
import { todayInAppTz } from "@/lib/date";
import { getDayEditorData } from "@/lib/queries";
import { DayNav } from "@/components/DayNav";
import { WaterQuickAdd } from "@/components/WaterQuickAdd";
import { SleepQuickLog } from "@/components/SleepQuickLog";
import { WeightQuickLog } from "@/components/WeightQuickLog";
import { MeasurementsQuickLog } from "@/components/MeasurementsQuickLog";
import { SymptomQuickLog } from "@/components/SymptomQuickLog";
import { PetCareQuickLog } from "@/components/PetCareQuickLog";
import { DayPillToggle } from "@/components/DayPillToggle";
import { TodayFoodList } from "@/components/TodayFoodList";
import { DayFoodAdd } from "@/components/DayFoodAdd";
import { DayWorkoutEditor } from "@/components/DayWorkoutEditor";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DayEditorPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const today = todayInAppTz();

  // A malformed or future date isn't editable — send her back to today's.
  if (!DATE_RE.test(date) || date > today) {
    redirect(`/day/${today}`);
  }

  const data = await getDayEditorData(date);
  if (!data) return null;

  const { profile } = data;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Editar un día</h1>
      <p className="text-sm text-muted -mt-2">
        Para completar información que te quedó pendiente o corregir algo de un día anterior.
      </p>

      <DayNav date={date} today={today} />

      <SymptomQuickLog existing={data.symptom} date={date} />

      <div className="grid grid-cols-2 gap-3">
        <WaterQuickAdd currentMl={data.waterMl} targetMl={profile.water_target_ml} date={date} />
        <SleepQuickLog
          currentHours={data.sleepHours}
          targetHours={profile.sleep_target_hours}
          currentBedtime={data.sleepBedtime}
          currentWakeUps={data.sleepWakeUps}
          date={date}
        />
      </div>

      <WeightQuickLog todayWeightKg={data.weightKg} lastKnownWeightKg={profile.weight_kg} date={date} />
      <MeasurementsQuickLog latest={data.measurement} previous={null} date={date} />

      {profile.tracks_pets && <PetCareQuickLog today={data.petCare} pausedUntil={profile.pet_care_paused_until} date={date} />}

      {profile.on_birth_control && <DayPillToggle taken={data.pillTaken} date={date} />}

      <section className="card p-4">
        <h2 className="font-semibold mb-2 text-sm">Comida</h2>
        <TodayFoodList logs={data.foodLogs} />
      </section>
      <DayFoodAdd date={date} />

      <DayWorkoutEditor logs={data.workoutLogs} date={date} />
    </div>
  );
}
