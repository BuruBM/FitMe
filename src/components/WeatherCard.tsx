import Link from "next/link";
import { Cloud, CloudSun, Sun } from "lucide-react";
import type { CurrentWeather } from "@/lib/weather";
import { IconBadge } from "@/components/IconBadge";

function WeatherIcon({ cloudCoverPct }: { cloudCoverPct: number }) {
  if (cloudCoverPct < 30) return <Sun size={14} />;
  if (cloudCoverPct < 70) return <CloudSun size={14} />;
  return <Cloud size={14} />;
}

export function WeatherCard({ weather, city }: { weather: CurrentWeather | null; city: string | null }) {
  if (!city) {
    return (
      <section className="card p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconBadge icon={<Cloud size={14} />} tint="var(--tint-weather)" color="var(--icon-weather)" size={26} />
          Clima
        </div>
        <p className="text-xs text-muted mt-1.5">
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
      <section className="card p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconBadge icon={<Cloud size={14} />} tint="var(--tint-weather)" color="var(--icon-weather)" size={26} />
          Clima
        </div>
        <p className="text-xs text-muted mt-1.5">No pudimos obtener el clima de {city} ahora.</p>
      </section>
    );
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <IconBadge
            icon={<WeatherIcon cloudCoverPct={weather.cloudCoverPct} />}
            tint="var(--tint-weather)"
            color="var(--icon-weather)"
            size={26}
          />
          {city}
        </div>
        <span className="text-sm font-medium">{weather.tempC}°C</span>
      </div>
      <p className="text-xs text-muted mt-1.5">
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
