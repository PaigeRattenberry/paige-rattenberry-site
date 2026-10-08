"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import type { SiteRoute } from "@/lib/routes";

import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Primary navigation. A container query shows every link inline once they all fit, and a
 * disclosure menu below that, including under enlarged text. Choosing a link closes the menu;
 * Escape closes it and returns focus to the button.
 */
export function Nav({ routes }: { routes: readonly SiteRoute[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = (items: readonly SiteRoute[]) =>
    items.map((r) => {
      const active = isActive(pathname, r.path);
      const className = `link-quiet block rounded-sm py-2 text-[0.95rem] ${
        active
          ? "text-ink decoration-accent underline decoration-2 underline-offset-8"
          : "text-ink-2"
      }`;
      return (
        <li key={r.path}>
          {r.kind === "redirect" ? (
            // A redirect lands on a document (the resume PDF), so it is a plain anchor: the
            // client router would otherwise prefetch and fetch it as a page.
            <a href={r.path} onClick={() => setOpen(false)} className={className}>
              {r.label}
            </a>
          ) : (
            <Link
              href={r.path}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={className}
            >
              {r.label}
            </Link>
          )}
        </li>
      );
    });

  return (
    <nav aria-label="Primary" className="flex shrink-0 items-center gap-3">
      <ul className="nav-inline items-center gap-5 whitespace-nowrap">{links(routes)}</ul>
      <ThemeToggle />
      <button
        ref={buttonRef}
        type="button"
        className="nav-disclosure border-line text-ink-2 hover:border-line-2 hover:text-ink inline-flex size-9 items-center justify-center rounded-md border"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="nav-disclosure border-line bg-paper absolute inset-x-0 top-full max-h-[70dvh] overflow-y-auto border-b"
      >
        <ul className="max-w-content mx-auto px-5 py-3 sm:px-8">{links(routes)}</ul>
      </div>
    </nav>
  );
}
