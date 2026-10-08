import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "@/components/layout/Header";
import { profile } from "@/lib/content/load";
import { navRoutes } from "@/lib/routes";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/stimmap3d",
}));

describe("Header", () => {
  it("links the name home and lists every nav route", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: `${profile.name}, home` })).toHaveAttribute(
      "href",
      "/",
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const route of navRoutes) {
      const links = within(nav).getAllByRole("link", { name: route.label });
      expect(links.some((l) => l.getAttribute("href") === route.path)).toBe(true);
    }
  });

  it("marks the current section with aria-current", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const current = within(nav)
      .getAllByRole("link", { name: "Projects" })
      .filter((l) => l.getAttribute("aria-current") === "page");
    expect(current.length).toBeGreaterThan(0);
  });

  it("exposes the mobile menu as a disclosure button", () => {
    render(<Header />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.getAttribute("aria-controls")).toBeTruthy();
  });
});
