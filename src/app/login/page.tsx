import Link from "next/link";
import { signInWithPassword, signUpWithPassword } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-semibold text-foreground">FitMe</h1>
          <p className="text-muted text-sm mt-1">
            Tu seguimiento personal de alimentación, entrenamiento, descanso y agua.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {decodeURIComponent(error)}
            </p>
          )}

          <form action={isSignup ? signUpWithPassword : signInWithPassword} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground/80" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="vos@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 text-sm hover:opacity-90 transition"
            >
              {isSignup ? "Crear cuenta" : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            {isSignup ? (
              <>
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-primary font-medium">
                  Ingresá
                </Link>
              </>
            ) : (
              <>
                ¿Primera vez acá?{" "}
                <Link href="/login?mode=signup" className="text-primary font-medium">
                  Creá tu cuenta
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
