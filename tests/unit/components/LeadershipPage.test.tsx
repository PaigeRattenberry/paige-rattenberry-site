import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LeadershipPage from "@/app/leadership/page";
import { leadership } from "@/lib/content/load";

describe("/leadership", () => {
  beforeEach(() => {
    // happy-dom reports the (deliberately disabled) iframe page load as a console error.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders every leadership item from content, newest first", () => {
    render(<LeadershipPage />);
    const list = screen.getByRole("list", { name: "Leadership items" });
    const headings = within(list).getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(
      [...leadership]
        .sort((a, b) => b.periods[0].start.localeCompare(a.periods[0].start))
        .map((l) => l.title),
    );
  });

  it("renders the valedictorian timestamp through MetricStat with a public source", () => {
    render(<LeadershipPage />);
    const button = screen.getByRole("button", { name: /^Source for 45:27:/ });
    const tooltip = document.getElementById(button.getAttribute("aria-describedby")!)!;
    expect(tooltip).toHaveTextContent("Source: Valedictorian address, SFU convocation");
    expect(tooltip.textContent).not.toContain("_source/");
  });

  it("offers the convocation video as a click-to-load embed with the watch link always visible", () => {
    const { container } = render(<LeadershipPage />);
    const item = leadership.find((l) => l.id === "valedictorian")!;
    const watch = item.links![0].url;
    expect(container.querySelector("iframe")).toBeNull();
    const open = screen.getByRole("link", { name: "Watch on YouTube" });
    expect(open).toHaveAttribute("href", watch);
    expect(open).toHaveAttribute("target", "_blank");
    // The watch link is the frame's link, not a second plain link.
    expect(
      screen.getAllByRole("link").filter((a) => a.getAttribute("href") === watch),
    ).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Load the video" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/RKIO5EvDJ5Y?start=2727",
    );
    expect(frame).toHaveAttribute("title", item.links![0].label);
    expect(frame.getAttribute("allow")).toContain("fullscreen");
    expect(frame.getAttribute("allow")).toContain("picture-in-picture");
    // The caption beside the frame comes from the link's note in content, not the page.
    expect(screen.getByText(item.links![0].note!)).toBeInTheDocument();
  });

  it("shows no photo", () => {
    render(<LeadershipPage />);
    expect(document.querySelectorAll("img")).toHaveLength(0);
  });
});
