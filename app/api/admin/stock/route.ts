import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

function motDePasseValide(request: Request) {
  const fourni = request.headers.get("x-admin-password") ?? "";
  const attendu = process.env.ADMIN_PASSWORD ?? "";
  return attendu.length > 0 && fourni === attendu;
}

export async function GET(request: Request) {
  if (!motDePasseValide(request)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .select("drink_name, quantity")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ stock: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Impossible de charger le stock." },
      { status: 500 }
    );
  }
}
