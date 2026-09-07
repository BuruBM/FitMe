import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex-1 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Contame un poco de vos</h1>
          <p className="text-muted text-sm mt-1">
            Con esto calculamos tus objetivos de calorías, macros, agua y calcio. Podés ajustarlos después.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
