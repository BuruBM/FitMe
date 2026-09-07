import { NextRequest, NextResponse } from "next/server";

export interface OffResult {
  id: string;
  name: string;
  brand: string | null;
  unit: string;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  calcium_mg: number;
}

// Free-text search against Open Food Facts (no API key needed). Used as a
// fallback when the curated local database (src/data/foods.ts) has no match.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", q);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "10");
  url.searchParams.set(
    "fields",
    "code,product_name,brands,nutriments,serving_size,quantity",
  );

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "FitMe-App - personal health tracker" },
      // Open Food Facts can be slow; keep this from hanging the UI too long.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const data = await res.json();
    const products: unknown[] = Array.isArray(data.products) ? data.products : [];

    const results: OffResult[] = products
      .map((p): OffResult | null => {
        const product = p as Record<string, unknown>;
        const name = product.product_name as string | undefined;
        if (!name) return null;
        const nutriments = (product.nutriments ?? {}) as Record<string, number>;
        return {
          id: `off-${product.code ?? name}`,
          name: product.brands ? `${name} (${product.brands})` : name,
          brand: (product.brands as string) ?? null,
          unit: "100 g",
          quantity: 100,
          calories: Math.round(nutriments["energy-kcal_100g"] ?? 0),
          protein_g: Math.round((nutriments["proteins_100g"] ?? 0) * 10) / 10,
          carbs_g: Math.round((nutriments["carbohydrates_100g"] ?? 0) * 10) / 10,
          fat_g: Math.round((nutriments["fat_100g"] ?? 0) * 10) / 10,
          fiber_g: Math.round((nutriments["fiber_100g"] ?? 0) * 10) / 10,
          sodium_mg: Math.round((nutriments["sodium_100g"] ?? 0) * 1000),
          calcium_mg: Math.round((nutriments["calcium_100g"] ?? 0) * 1000),
        };
      })
      .filter((r): r is OffResult => r !== null && r.calories > 0)
      .slice(0, 8);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
