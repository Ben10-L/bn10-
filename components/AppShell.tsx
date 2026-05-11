"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BrainCircuit, Home, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/quiz/ml-random", label: "Quiz ML", icon: BrainCircuit },
  { href: "/quiz/rn-random", label: "Quiz RN", icon: BrainCircuit }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
        <div className="absolute left-6 top-24 h-px w-44 bg-white/30" />
        <div className="absolute right-10 top-40 h-32 w-px bg-red-500/45" />
        <div className="absolute bottom-24 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border border-red-500/40" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/15 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 focus-ring rounded-lg">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-black shadow-glow">
              <Image src="/favicon.png" alt="Bn10" width={28} height={28} className="h-7 w-7 rounded-full object-cover" priority />
            </span>
            <span className="dot-title text-lg font-semibold">Bn10</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`focus-ring rounded-full border px-3 py-2 text-sm transition ${
                    active ? "border-red-500/60 bg-red-500/10 text-white" : "border-transparent text-gray-300 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/#search"
              className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-gray-300 transition hover:border-red-500/50 hover:text-white"
              aria-label="Aller à la recherche"
              title="Recherche"
            >
              <Search size={17} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">{children}</main>

      <nav className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-3 rounded-[1.4rem] border border-white/15 bg-black/90 p-2 shadow-2xl backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition ${
                active ? "bg-red-500/12 text-white" : "text-gray-400"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
