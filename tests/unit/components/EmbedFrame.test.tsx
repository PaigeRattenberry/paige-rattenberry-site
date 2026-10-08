import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EmbedFrame } from "@/components/embed/EmbedFrame";

const SRC = "https://example.com/embed?view=fixture";

describe("EmbedFrame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // happy-dom reports the (deliberately disabled) iframe page load as a console error.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("mounts no iframe before the click, and always offers the new-tab link", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture demo" />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByText("Fixture demo")).toBeInTheDocument();
    const open = screen.getByRole("link", { name: "Open in a new tab" });
    expect(open).toHaveAttribute("href", SRC);
    expect(open).toHaveAttribute("target", "_blank");
    expect(open.getAttribute("rel")).toContain("noopener");
    expect(container.firstElementChild).toHaveAttribute("data-embed-status", "idle");
  });

  it("mounts the iframe with the src and title only after the button is clicked", () => {
    const { container } = render(
      <EmbedFrame src={SRC} title="Fixture demo" loadLabel="Load the fixture" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Load the fixture" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", SRC);
    expect(frame).toHaveAttribute("title", "Fixture demo");
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-embed-status", "loading");

    fireEvent.load(frame);
    expect(container.firstElementChild).toHaveAttribute("data-embed-status", "loaded");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("keeps a 16:9 poster, grows only after the click when asked to, and numbers on request", () => {
    const { container } = render(
      <EmbedFrame src={SRC} title="Fixture demo" loadedFrameClassName="aspect-[4/3]" number={1} />,
    );
    const frame = () => container.querySelector("figure > div")!;
    expect(frame().className).toContain("aspect-video");
    expect(container.querySelector("figcaption")).toHaveTextContent("Fig. 1");
    fireEvent.click(screen.getByRole("button"));
    expect(frame().className).not.toContain("aspect-video");
    expect(frame().className).toContain("aspect-[4/3]");
  });

  it("stays 16:9 and unnumbered by default", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture demo" />);
    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("figure > div")!.className).toContain("aspect-video");
    expect(container.querySelector("figcaption")).not.toHaveTextContent("Fig.");
  });

  it("moves keyboard focus to the frame that replaces the clicked button", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture demo" />);
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(container.querySelector("iframe"));
  });

  it("keeps one live region mounted from the first render and changes only its text", () => {
    render(<EmbedFrame src={SRC} title="Fixture demo" timeoutSeconds={2} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Nothing loads until you ask for it.");
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", status.id);
    fireEvent.click(screen.getByRole("button"));
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByRole("status")).toBe(status);
  });

  it("shows the fallback when the frame never reports a load, and not after it does", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture demo" timeoutSeconds={2} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Open it in a new tab");
    expect(screen.getByRole("link", { name: "Open in a new tab" })).toHaveAttribute("href", SRC);
    // The frame stays mounted, in case it is merely slow.
    expect(container.querySelector("iframe")).not.toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-embed-status", "failed");
  });

  it("does not time out a frame that loaded", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture demo" timeoutSeconds={2} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.load(container.querySelector("iframe")!);
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByRole("status")).not.toHaveTextContent("could not be shown");
    expect(container.firstElementChild).toHaveAttribute("data-embed-status", "loaded");
  });

  it("frames src but links href when they differ, and passes allow to the iframe", () => {
    const watch = "https://example.com/watch?v=fixture&t=10s";
    const { container } = render(
      <EmbedFrame
        src={SRC}
        href={watch}
        title="Fixture video"
        allow="autoplay; picture-in-picture; fullscreen"
        openLabel="Watch elsewhere"
        loadLabel="Load the video"
      />,
    );
    expect(screen.getByRole("link", { name: "Watch elsewhere" })).toHaveAttribute("href", watch);
    fireEvent.click(screen.getByRole("button", { name: "Load the video" }));
    const frame = container.querySelector("iframe")!;
    expect(frame).toHaveAttribute("src", SRC);
    expect(frame).toHaveAttribute("allow", "autoplay; picture-in-picture; fullscreen");
    // The link keeps pointing at the watch page after the frame mounts.
    expect(screen.getByRole("link", { name: "Watch elsewhere" })).toHaveAttribute("href", watch);
  });

  it("keeps the same caption text before and after the load click", () => {
    render(
      <EmbedFrame src={SRC} title="Fixture">
        Always here
      </EmbedFrame>,
    );
    expect(screen.getByText("Always here")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Always here")).toBeInTheDocument();
  });

  it("defaults allow to fullscreen and says nothing embed-specific in the fallback", () => {
    const { container } = render(<EmbedFrame src={SRC} title="Fixture" timeoutSeconds={1} />);
    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector("iframe")).toHaveAttribute("allow", "fullscreen");
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    const status = screen.getByRole("status").textContent ?? "";
    expect(status).toMatch(/could not be shown here/);
    expect(status).not.toMatch(/demo|video/i);
  });

  it("renders a poster from assets.json data and always-visible caption text", () => {
    render(
      <EmbedFrame
        src={SRC}
        title="Fixture demo"
        poster={{
          path: "images/fixture/poster.png",
          alt: "Fixture poster",
          width: 1600,
          height: 900,
        }}
      >
        Illustrative model — not for clinical use
      </EmbedFrame>,
    );
    expect(screen.getByRole("img", { name: "Fixture poster" })).toBeInTheDocument();
    expect(screen.getByText("Illustrative model — not for clinical use")).toBeInTheDocument();
  });
});
