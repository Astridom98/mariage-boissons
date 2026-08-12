"use client";

import { useEffect, useState } from "react";

type Boisson = { nom: string; disponible: boolean };

export default function Page() {
  const [boissons, setBoissons] = useState<Boisson[]>([]);
  const [chargement, setChargement] = useState(true);
  const [prenom, setPrenom] = useState("");
  const [table, setTable] = useState("");
  const [boisson, setBoisson] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    prenom: string;
    boisson: string;
  } | null>(null);

  async function chargerStock() {
    try {
      const res = await fetch("/api/stock", { cache: "no-store" });
      const data = await res.json();
      setBoissons(data.boissons ?? []);
    } catch {
      setErreur("Impossible de charger la liste des boissons.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerStock();
  }, []);

  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (!prenom.trim() || !table.trim() || !boisson) {
      setErreur("Merci de remplir tous les champs.");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, table, boisson }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErreur(data.error ?? "Une erreur est survenue.");
        await chargerStock();
        setBoisson("");
        return;
      }

      setConfirmation({ prenom: data.prenom, boisson: data.boisson });
    } catch {
      setErreur("Une erreur est survenue, merci de réessayer.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        {confirmation ? (
          <p style={styles.confirmation}>
            ✅ Merci {confirmation.prenom}, la commande de la boisson{" "}
            {confirmation.boisson} est enregistrée ! Un(e) serveur(se)
            passera bientôt.
          </p>
        ) : (
          <>
            <h1 className="display" style={styles.titre}>
              Merci infiniment pour votre présence aujourd&apos;hui 🤍
            </h1>
            <p style={styles.sousTitre}>
              Pour faciliter le service, choisissez votre boisson ici :
            </p>

            <form onSubmit={valider} style={styles.form}>
              <label style={styles.label}>
                Quel est votre prénom ?
                <input
                  style={styles.input}
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  disabled={envoi}
                />
              </label>

              <label style={styles.label}>
                Quel est votre numéro de table ?
                <input
                  style={styles.input}
                  type="text"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="Ex. 12"
                  disabled={envoi}
                />
              </label>

              <label style={styles.label}>
                Quelle boisson souhaitez-vous ?
                <select
                  style={styles.input}
                  value={boisson}
                  onChange={(e) => setBoisson(e.target.value)}
                  disabled={envoi || chargement}
                >
                  <option value="" disabled>
                    {chargement ? "Chargement…" : "Sélectionnez une boisson"}
                  </option>
                  {boissons.map((b) => (
                    <option key={b.nom} value={b.nom} disabled={!b.disponible}>
                      {b.nom} {!b.disponible ? "(épuisé)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {erreur && <p style={styles.erreur}>{erreur}</p>}

              <button type="submit" style={styles.bouton} disabled={envoi}>
                {envoi ? "Envoi…" : "Valider"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: "32px 28px",
    boxShadow: "0 10px 30px rgba(62,42,56,0.08)",
    textAlign: "center",
  },
  titre: {
    fontSize: 26,
    lineHeight: 1.3,
    margin: "0 0 8px",
  },
  sousTitre: {
    margin: "0 0 24px",
    color: "#6b5a63",
    fontSize: 15,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    textAlign: "left",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
    color: "#4a3b47",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    fontSize: 16,
    fontFamily: "inherit",
    background: "#fdfbf8",
    color: "var(--plum)",
  },
  bouton: {
    marginTop: 8,
    padding: "14px",
    borderRadius: 10,
    border: "none",
    background: "var(--gold)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  erreur: {
    margin: 0,
    color: "#a3384a",
    fontSize: 14,
    background: "#fbe9eb",
    padding: "10px 12px",
    borderRadius: 8,
  },
  confirmation: {
    fontSize: 18,
    lineHeight: 1.6,
    margin: 0,
  },
};
