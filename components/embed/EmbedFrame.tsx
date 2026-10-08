"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

export type EmbedPoster = {
  /** Path under public/, as listed in content/assets.json. */
  path: string;
  alt: string;
  width: number;
  height: number;
};

/** The poster's `sizes` when the frame sits in the prose column. */
const PROSE_SIZES = "(min-width: 1024px) 48rem, 100vw";

type EmbedFrameProps = {
  /** The page to frame; the iframe is created only after the visitor asks for it. */
  src: string;
  /**
   * Where the always-visible link opens, when it differs from `src` (a YouTube watch URL with
   * its timestamp beside a `/embed/` frame, say). Defaults to `src`.
   */
  href?: string;
  /** Accessible name of the frame, e.g. "StimMap3D interactive demo". */
  title: string;
  /** Text of the always-visible link that opens `href` in a new tab. */
  openLabel?: string;
  /** Text of the load button. */
  loadLabel?: string;
  /** The iframe's permissions policy; "fullscreen" unless the embed needs more. */
  allow?: string;
  /** Poster image from content/assets.json; without one the frame shows the title. */
  poster?: EmbedPoster;
  /** The poster's `sizes`; the prose column's unless the frame is wider. */
  posterSizes?: string;
  /** Seconds to wait for the frame's load event before offering the fallback link. */
  timeoutSeconds?: number;
  /** Always-visible text around the frame, e.g. StimMap3D's disclaimer (DESIGN §7.1). */
  children?: React.ReactNode;
  /** Extra classes for the figure. Its margin is always `my-8`; a margin passed here loses to it. */
  className?: string;
  /**
   * The frame's shape once the visitor has asked for it, as aspect-ratio classes. The poster is
   * always 16:9 (DESIGN §7.1); a framed page that needs more height (StimMap3D opens on a banner
   * and a card above its canvas) grows on the click, which is a change the visitor asked for.
   */
  loadedFrameClassName?: string;
  /** Figure number, shown as "Fig. 1" before the caption when the poster is the page's cover. */
  number?: number;
};

type Status = "idle" | "loading" | "loaded" | "failed";

/**
 * Click-to-load iframe (DESIGN §7.1). Renders a 16:9 poster with one button; the iframe is
 * mounted only after the click, so third-party script, WebGL and video stay off the initial
 * page. The "open in a new tab" link is always present and doubles as the fallback: if the
 * frame never reports a load within the timeout, the caption says so and points at the link.
 * Limits, stated plainly: browsers fire no error event for an iframe, React listens only for
 * `load` on iframes, and a page refused by X-Frame-Options or a CSP `frame-ancestors` still
 * fires `load` for the browser's refusal page, which a cross-origin parent cannot inspect. So
 * the timeout catches a hang, not a refusal; the embedding session must check the target's
 * response headers before mounting it (IMPLEMENTATION_PLAN Session 3b task 2). Reusable:
 * nothing here knows what it embeds; the wording fits a demo or a video alike.
 */
export function EmbedFrame({
  src,
  href = src,
  title,
  openLabel = "Open in a new tab",
  loadLabel = "Load interactive demo",
  allow = "fullscreen",
  poster,
  posterSizes = PROSE_SIZES,
  timeoutSeconds = 15,
  children,
  className = "",
  loadedFrameClassName = "aspect-video",
  number,
}: EmbedFrameProps) {
  const [status, setStatus] = useState<Status>("idle");
  const statusId = useId();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (status !== "loading") return;
    // The clicked button unmounts; hand keyboard focus to the frame that replaced it, or it
    // falls back to <body>.
    frameRef.current?.focus();
    const timer = window.setTimeout(() => setStatus("failed"), timeoutSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [status, timeoutSeconds]);

  return (
    <figure className={["my-8", className].join(" ")} data-embed-status={status}>
      <div
        className={[
          "border-line bg-surface relative overflow-hidden rounded-md border",
          status === "idle" ? "aspect-video" : loadedFrameClassName,
        ].join(" ")}
      >
        {status === "idle" ? (
          <>
            {poster ? (
              <Image
                src={`/${poster.path}`}
                alt={poster.alt}
                width={poster.width}
                height={poster.height}
                sizes={posterSizes}
                // A poster is the top of its page, and usually its largest paint. The bundled
                // Next docs prefer these two over `preload`; Lighthouse measured no difference.
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover object-left-top"
              />
            ) : (
              // Smaller below sm: a 16:9 frame is about 160 px tall on a phone, and a three-line
              // title at text-2xl ran underneath the load button at 360 px.
              <p className="font-display text-ink-2 absolute inset-x-5 top-5 text-base leading-snug sm:text-2xl sm:leading-8">
                {title}
              </p>
            )}
            <div className="absolute inset-0 flex items-end justify-start p-5">
              <button
                type="button"
                onClick={() => setStatus("loading")}
                aria-describedby={statusId}
                className="bg-accent text-on-accent hover:bg-accent-2 inline-flex min-h-10 items-center rounded-md px-4 py-2 text-[0.95rem] font-medium transition-colors duration-150"
              >
                {loadLabel}
              </button>
            </div>
          </>
        ) : (
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            allow={allow}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setStatus("loaded")}
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
      </div>
      <figcaption className="mono-label mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {number !== undefined ? <span className="text-ink">Fig. {number}</span> : null}
        {/* One live region that exists from the first render and only changes its text:
            screen readers often skip a live region that is inserted already filled. */}
        <span id={statusId} role="status">
          {status === "idle" ? "Nothing loads until you ask for it." : null}
          {status === "loading" ? "Loading…" : null}
          {status === "failed"
            ? "This could not be shown here. Open it in a new tab instead."
            : null}
        </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent"
          data-testid="embed-open"
        >
          {openLabel}
        </a>
        {children ? <span className="text-ink">{children}</span> : null}
      </figcaption>
    </figure>
  );
}
