/**
 * Embed URLs derived from the watch links kept in content/ (IMPLEMENTATION_PLAN §4 Session 4).
 * YouTube refuses to frame a `/watch` page, so the iframe needs the embed form while the
 * visible link keeps the watch URL, timestamp included. Pure; tested in tests/unit.
 */

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);

/** "2727s", "2727", "45m27s" or "1h2m3s" as a whole number of seconds; null when unparseable. */
export function parseYouTubeStart(t: string | null): number | null {
  if (!t) return null;
  if (/^\d+s?$/.test(t)) return Number(t.replace(/s$/, ""));
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  if (!m || m[0] === "") return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

export type YouTubeEmbed = {
  /** youtube-nocookie embed URL for the iframe, starting at the watch link's timestamp. */
  src: string;
  /** The original watch URL, for the always-visible link. */
  href: string;
  /** The video id. */
  id: string;
  /** Start offset in seconds, when the watch link carries one. */
  start: number | null;
};

/** The embed for a YouTube watch or youtu.be link, or null for any other URL. */
export function youtubeEmbed(url: string): YouTubeEmbed | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  let id: string | null = null;
  if (YOUTUBE_HOSTS.has(parsed.hostname) && parsed.pathname === "/watch") {
    id = parsed.searchParams.get("v");
  } else if (parsed.hostname === "youtu.be") {
    id = parsed.pathname.slice(1) || null;
  }
  if (!id || !/^[\w-]{6,}$/.test(id)) return null;
  const start = parseYouTubeStart(parsed.searchParams.get("t"));
  const src = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  if (start !== null && start > 0) src.searchParams.set("start", String(start));
  return { src: src.toString(), href: url, id, start };
}

/** Permissions YouTube's own embed code requests; EmbedFrame passes them to the iframe. */
export const YOUTUBE_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
