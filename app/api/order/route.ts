import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase";
import { envoyerNotificationTelegram } from "../../../lib/telegram";

function accesExpire() {
  const dateLimite = process.env.ACCESS_DEADLINE;
  if (!dateLimite) return false;
  return new Date() >= new Date(dateLimite);
}

export async function POST(request: Request) {
  if (accesExpire()) {
    return NextResponse.json(
      { error: "Cet événement est terminé. Ce lien n'est plus actif." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const prenom = (body.prenom ?? "").toString().trim();
    const table = (body.table ?? "").toString().trim();
    const boisson = (body.boisson ?? "").toString().trim();

    if (!prenom || !table || !boisson) {
      return NextResponse.json(
        { error: "Merci de remplir tous les champs." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: remaining, error: rpcError } = await supabase.rpc(
      "decrement_stock",
      { p_drink_name: boisson }
    );

    if (rpcError) throw rpcError;

    if (remaining === null) {
      return NextResponse.json(
        {
          error:
            "Désolé, cette boisson n'est plus disponible. Merci d'en choisir une autre.",
        },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase.from("orders").insert({
      prenom,
      table_number: table,
      drink_name: boisson,
    });

    if (insertError) throw insertError;

    await envoyerNotificationTelegram({ prenom, table, boisson });

    return NextResponse.json({ ok: true, prenom, boisson });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Une erreur est survenue, merci de réessayer." },
      { status: 500 }
    );
  }
}
