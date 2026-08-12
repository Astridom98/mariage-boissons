export async function envoyerNotificationTelegram(params: {
  prenom: string;
  table: string;
  boisson: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram non configuré : notification non envoyée.");
    return;
  }

  const texte = `🥂 Nouvelle commande\nTable : ${params.table}\nPrénom : ${params.prenom}\nBoisson : ${params.boisson}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texte,
      }),
    });
  } catch (err) {
    console.error("Erreur d'envoi Telegram :", err);
  }
}
