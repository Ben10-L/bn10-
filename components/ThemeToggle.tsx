"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeToggleProps = {
  variant?: "icon" | "mobileTab";
};

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("bn10-theme");
    const nextTheme = saved === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.localStorage.setItem("bn10-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }

  const Icon = theme === "light" ? Moon : Sun;
  const label = theme === "light" ? "Sombre" : "Clair";

  return (
    <button
      onClick={toggleTheme}
      className={
        variant === "mobileTab"
          ? "focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] text-gray-400 transition hover:text-white"
          : "focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-gray-300 transition hover:border-red-500/50 hover:text-white"
      }
      aria-label={theme === "light" ? "Passer au mode sombre" : "Passer au mode clair"}
      title={theme === "light" ? "Mode sombre" : "Mode clair"}
    >
      <Icon size={17} />
      {variant === "mobileTab" ? label : null}
    </button>
  );
}
