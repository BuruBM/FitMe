import { NextRequest, NextResponse } from "next/server";
import type { OffResult } from "@/app/api/food-search/route";

// Direct product lookup by barcode (EAN/UPC) — what a camera scan decodes —
// instead of the free-text search Open Food Facts also offers.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code || !/^\d{6,14}$/.test(code)) {
    return NextResponse.json({ result: null, error: "invalid_code" }, { status: 400 });
  }

  const url = new URL(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
  url.searchParams.set("fields", "code,product_name,brands,nutriments,serving_size,quantity,status");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LaMarea-App - personal health tracker" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ result: null, error: "not_found" });

    const data = await res.json();
    const product = data.product as Record<string, unknown> | undefined;
    const name = product?.product_name as string | undefined;
    if (data.status !== 1 || !product || !name) {
      return NextResponse.json({ result: null, error: "not_found" });
    }

    const nutriments = (product.nutriments ?? {}) as Record<string, number>;
    const calories = Math.round(nutriments["energy-kcal_100g"] ?? 0);
    if (calories <= 0) {
      return NextResponse.json({ result: null, error: "no_nutrition_data" });
    }

    const result: OffResult = {
      id: `off-${product.code ?? code}`,
      name: product.brands ? `${name} (${product.brands})` : name,
      brand: (product.brands as string) ?? null,
      unit: "100 g",
      quantity: 100,
      calories,
      protein_g: Math.round((nutriments["proteins_100g"] ?? 0) * 10) / 10,
      carbs_g: Math.round((nutriments["carbohydrates_100g"] ?? 0) * 10) / 10,
      fat_g: Math.round((nutriments["fat_100g"] ?? 0) * 10) / 10,
      fiber_g: Math.round((nutriments["fiber_100g"] ?? 0) * 10) / 10,
      sodium_mg: Math.round((nutriments["sodium_100g"] ?? 0) * 1000),
      calcium_mg: Math.round((nutriments["calcium_100g"] ?? 0) * 1000),
    };

    return NextResponse.json({ result, error: null });
  } catch {
    return NextResponse.json({ result: null, error: "network" });
  }
}
