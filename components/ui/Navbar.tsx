"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";
import { getUI } from "@/lib/content/ui";

export default function Navbar({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: ui.nav.now, href: `/${lang}#now` },
    { label: ui.nav.experience, href: `/${lang}#experience` },
    { label: ui.nav.work, href: `/${lang}#work` },
    { label: ui.nav.opensource, href: `/${lang}#opensource` },
    { label: ui.nav.contact, href: `/${lang}#contact` },
  ];

  /** 현재 경로에서 언어 세그먼트만 갈아끼운다 */
  const swapLang = (next: Lang) => {
    const rest = pathname.split("/").slice(2).join("/");
    return rest ? `/${next}/${rest}` : `/${next}`;
  };

  const other = LANGS.find((l) => l !== lang)!;

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href={`/${lang}`}
          className="font-mono text-sm tracking-[0.2em] text-foreground"
        >
          DH<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-7 text-sm text-muted sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={swapLang(other)}
            aria-label={ui.nav.switchLang}
            className="hidden items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-accent sm:flex"
          >
            <span className="text-foreground">{LANG_LABEL[lang]}</span>
            <span aria-hidden>/</span>
            <span>{LANG_LABEL[other]}</span>
          </Link>

          <button
            type="button"
            aria-label={open ? ui.nav.closeMenu : ui.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center sm:hidden"
          >
            <span
              className={`absolute h-px w-5 bg-foreground transition-all duration-300 ${
                open ? "rotate-45" : "-translate-y-[5px]"
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-foreground transition-all duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-foreground transition-all duration-300 ${
                open ? "-rotate-45" : "translate-y-[5px]"
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-line bg-background/95 sm:hidden"
          >
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-6 py-3.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-line">
                <Link
                  href={swapLang(other)}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-3.5 font-mono text-xs text-faint"
                >
                  {ui.nav.switchLang}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
