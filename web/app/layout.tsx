import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Career Ops",
  description: "AI-powered job search pipeline",
};

const nav = [
  { href: "/", label: "Tracker" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/scan", label: "Scan" },
  { href: "/cv", label: "CV Builder" },
  { href: "/apply", label: "Apply Assistant" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-teal-400 text-lg tracking-tight">career-ops</span>
          <div className="flex gap-4">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}
                className="text-sm text-gray-400 hover:text-white transition-colors">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
