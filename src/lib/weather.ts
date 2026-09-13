// Open-Meteo: free, no API key. Used to (a) show today's weather on the
// dashboard and (b) auto-attach cloud cover to her daily symptom log, so she
// can see over time whether cloudy days actually track with lower mood.

export interface CurrentWeather {
  tempC: number;
  cloudCoverPct: number;
  condition: string;
}

// Simplified WMO weather codes -> short Spanish label.
function conditionFromCode(code: number): string {
  if (code === 0) return "Despejado";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code <= 48) return "Neblina";
  if (code <= 57) return "Llovizna";
  if (code <= 67) return "Lluvia";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chaparrones";
  if (code <= 99) return "Tormenta";
  return "—";
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lon.toString());
    url.searchParams.set("current", "temperature_2m,cloud_cover,weather_code");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 900 } });
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    return {
      tempC: Math.round(current.temperature_2m),
      cloudCoverPct: Math.round(current.cloud_cover),
      condition: conditionFromCode(current.weather_code),
    };
  } catch {
    return null;
  }
}

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
}

export async function geocodeCity(city: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", city);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "es");

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    return { name: result.name, latitude: result.latitude, longitude: result.longitude };
  } catch {
    return null;
  }
}
