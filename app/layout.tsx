import "./globals.css";

export const metadata = {
  title: "Choisissez votre boisson",
  description: "Commande de boisson pour le mariage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
