import Link from "next/link";

import { profile } from "@/lib/content/load";
import { navRoutes } from "@/lib/routes";

import { Nav } from "./Nav";

/** Sticky top bar: name (serif) on the left, nav and theme toggle on the right. */
export function Header() {
  return (
    <header className="border-line bg-paper/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="header-shell max-w-content relative mx-auto flex min-h-14 flex-wrap items-center justify-between gap-2 px-5 py-2 sm:px-8">
        <Link
          href="/"
          className="link-quiet font-display text-ink min-w-0 text-[1.2rem] tracking-tight"
          aria-label={`${profile.name}, home`}
        >
          {profile.name}
        </Link>
        <Nav routes={navRoutes} />
      </div>
    </header>
  );
}
