import Link from "next/link";
import { Cloud, CloudSun, Sun } from "lucide-react";
import type { CurrentWeather } from "@/lib/weather";

function WeatherIcon({ cloudCoverPct }: { cloudCoverPct: number }) {
  if (cloudCoverPct < 30) return <Sun size={18} className="text-accent" />;
  if (cloudCoverPct < 70) return <CloudSun size={18} className="text-accent" />;
  return <Cloud size={18} className="text-muted" />;
}

export function WeatherCard({ weather, city }: { weather: CurrentWeather | null; city: string | null }) {
  if (!city) {
    return (
      <section className="card p-4" style={{ background: "var(--tint-weather)" }}>
        <p className="text-sm font-medium">Clima</p>
        <p className="text-xs text-muted mt-1">
          Configurá tu ciudad en el Perfil para ver el clima y cruzarlo con tu ánimo.
        </p>
        <Link href="/profile" className="text-xs text-primary font-medium mt-2 inline-block">
          Ir a Perfil
        </Link>
      </section>
    );
  }

  if (!weather) {
    return (
      <section className="card p-4" style={{ background: "var(--tint-weather)" }}>
        <p className="text-sm font-medium">Clima</p>
        <p className="text-xs text-muted mt-1">No pudimos obtener el clima de {city} ahora.</p>
      </section>
    );
  }

  return (
    <section className="card p-4" style={{ background: "var(--tint-weather)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <WeatherIcon cloudCoverPct={weather.cloudCoverPct} />
          {city}
        </div>
        <span className="text-sm font-medium">{weather.tempC}°C</span>
      </div>
      <p className="text-xs text-muted mt-1">
        {weather.condition} · {weather.cloudCoverPct}% nublado
      </p>
      {weather.cloudCoverPct >= 70 && (
        <p className="text-[11px] text-muted mt-1.5">
          Día bien nublado — si notás el ánimo más bajo hoy, puede tener que ver. Sé amable con vos misma.
        </p>
      )}
    </section>
  );
}
