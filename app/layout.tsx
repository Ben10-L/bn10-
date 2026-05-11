import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bn10",
  description: "Plateforme de quiz pour réviser le Machine Learning et les réseaux de neurones.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#F6F3EA"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="light" suppressHydrationWarning>
      <body className="app-theme">
        <Script id="bn10-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('bn10-theme')||'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t!=='dark')}catch(e){document.documentElement.classList.add('light')}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
