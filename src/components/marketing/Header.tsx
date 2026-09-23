"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/#cat-behavior", label: "貓咪習性" },
  { href: "/#cat-mistakes", label: "常見錯誤" },
  { href: "/#calories", label: "計算熱量" },
  { href: "/#records", label: "紀錄飲食體重" },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm font-medium whitespace-nowrap text-foreground/70 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/adoption"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            領養小貓
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-background px-6 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.concat([{ href: "/adoption", label: "領養小貓" }]).map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-blush-soft hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
