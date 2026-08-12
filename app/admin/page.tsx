"use client";

import { useEffect, useState } from "react";

type Ligne = { drink_name: string; quantity: number };

export default function AdminPage() {
  const [motDePasse, setMotDePasse] = useState("");
  const [motDePasseValide, setMotDePasseValide] = useState<string | null>(
    null
  );
  const [stock, setStock] = useState<Ligne[]>([]);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [derniereMaj, setDerniereMaj] = useState<string>("");

  useEffect(() => {
    const sauvegarde = sessionStorage.getItem("admin-password");
    if (sauvegarde) {
      setMotDePasseValide(sauvegarde);
    }
  }, []);

  useEffect(() => {
    if (!motDePasseValide) return;
    charger(motDePasseValide);
    const intervalle = setInterval(() => charger(motDePasseValide), 15000);
    return () => clearInterval(intervalle);
  }, [motDePasseValide]);

  async function charger(mdp: string) {
    setChargement(true);
    try {
      const res = await fetch("/api/admin/stock", {
        headers: { "x-admin-password": mdp },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "Mot de passe incorrect.");
        setMotDePasseValide(null);
        sessionStorage.removeItem("admin-password");
        return;
      }
      setStock(data.stock ?? []);
      setDerniereMaj(new Date().toLocaleTimeString("fr-FR"));
      setErreur("");
    } catch {
      setErreur("Impossible de charger le stock.");
    } finally {
      setChargement(false);
    }
  }

  function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin-password", motDePasse);
    setMotDePasseValide(motDePasse);
  }

  if (!motDePasseValide) {
    return (
      <main style={styles.main}>
        <form onSubmit={seConnecter} style={styles.card}>
          <h1 className="display" style={styles.titre}>
            Espace gestion du stock
          </h1>
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
          {erreur && <p style={styles.erreur}>{erreur}</p>}
          <button type="submit" style={styles.bouton}>
            Accéder au stock
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={{ ...styles.card, maxWidth: 560 }}>
        <h1 className="display" style={styles.titre}>
          Suivi du stock en direct
        </h1>
        {derniereMaj && (
          <p style={styles.info}>Dernière mise à jour : {derniereMaj}</p>
        )}
        {erreur && <p style={styles.erreur}>{erreur}</p>}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Boisson</th>
              <th style={styles.th}>Quantité restante</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((ligne) => (
              <tr key={ligne.drink_name}>
                <td style={styles.td}>{ligne.drink_name}</td>
                <td
                  style={{
                    ...styles.td,
                    fontWeight: 600,
                    color: ligne.quantity === 0 ? "#a3384a" : "var(--plum)",
                  }}
                >
                  {ligne.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          style={{ ...styles.bouton, marginTop: 16 }}
          onClick={() => charger(motDePasseValide)}
          disabled={chargement}
        >
          {chargement ? "Actualisation…" : "Actualiser maintenant"}
        </button>
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
    maxWidth: 380,
    background: "#fff",
    border: "1px solid var(--line)",
    borderRadius: 16,
    padding: "32px 28px",
    boxShadow: "0 10px 30px rgba(62,42,56,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  titre: {
    fontSize: 22,
    margin: "0 0 4px",
    textAlign: "center",
  },
  info: {
    fontSize: 13,
    color: "#6b5a63",
    textAlign: "center",
    margin: 0,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    fontSize: 16,
    fontFamily: "inherit",
  },
  bouton: {
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "var(--gold)",
    color: "#fff",
    fontSize: 15,
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
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid var(--line)",
    padding: "8px 6px",
    color: "#6b5a63",
    fontWeight: 600,
  },
  td: {
    padding: "8px 6px",
    borderBottom: "1px solid var(--line)",
  },
};
