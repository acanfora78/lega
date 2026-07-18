import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Outfit, Rajdhani } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

// Serif editoriale a ottica variabile: firma tipografica "luxury" dell'app,
// leggibile tanto nei titoli hero quanto nelle piccole etichette delle card.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: {
    default: "Lega Calcio Over 40 — Campo Santa Teresa, Scafati",
    template: "%s · Lega Calcio Over 40",
  },
  description:
    "L'app ufficiale della Lega Calcio Over 40 del Campo Sportivo Santa Teresa di Scafati. Risultati live, classifiche, statistiche, squadre e tutta la passione del campionato.",
  applicationName: "Lega Calcio Over 40",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lega Over 40",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

// I dati della Lega vivono nello store server-side (file o Supabase) e cambiano
// ad ogni azione dell'area organizzatore: nessuna pagina va prerenderizzata in
// modo statico a build time, altrimenti mostrerebbe uno snapshot obsoleto.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#060907",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${rajdhani.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <PwaRegister />
          <TopHeader />
          <main className="flex-1 pb-24 md:pb-10">{children}</main>
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
