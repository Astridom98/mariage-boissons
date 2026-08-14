import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .select("drink_name, quantity")
      .order("id", { ascending: true });

    if (error) throw error;

    const boissons = (data ?? []).map((row) => ({
      nom: row.drink_name,
      disponible: row.quantity > 0,
    }));

    return NextResponse.json({ boissons });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Impossible de charger la liste des boissons." },
      { status: 500 }
    );
  }
}
