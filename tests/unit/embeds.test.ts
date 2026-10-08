import { describe, expect, it } from "vitest";

import { leadership } from "@/lib/content/load";
import { parseYouTubeStart, youtubeEmbed } from "@/lib/embeds";

describe("youtubeEmbed", () => {
  it("frames a watch URL through youtube-nocookie and keeps the watch URL for the link", () => {
    const embed = youtubeEmbed("https://www.youtube.com/watch?v=abcdefghijk&t=2727s")!;
    expect(embed.src).toBe("https://www.youtube-nocookie.com/embed/abcdefghijk?start=2727");
    expect(embed.href).toBe("https://www.youtube.com/watch?v=abcdefghijk&t=2727s");
    expect(embed.start).toBe(2727);
  });

  it("handles youtu.be links, missing timestamps and h/m/s timestamps", () => {
    expect(youtubeEmbed("https://youtu.be/abcdefghijk")!.src).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
    );
    expect(youtubeEmbed("https://youtube.com/watch?v=abcdefghijk&t=45m27s")!.src).toContain(
      "start=2727",
    );
    expect(parseYouTubeStart("1h2m3s")).toBe(3723);
    expect(parseYouTubeStart("90")).toBe(90);
    expect(parseYouTubeStart("later")).toBeNull();
    expect(parseYouTubeStart(null)).toBeNull();
  });

  it("returns null for anything that is not a YouTube video", () => {
    expect(youtubeEmbed("https://www.sfu.ca/")).toBeNull();
    expect(youtubeEmbed("https://www.youtube.com/@channel")).toBeNull();
    expect(youtubeEmbed("not a url")).toBeNull();
  });

  it("derives the valedictorian embed from the watch link in content/leadership.ts", () => {
    const item = leadership.find((l) => l.id === "valedictorian")!;
    const embed = youtubeEmbed(item.links![0].url)!;
    expect(embed).not.toBeNull();
    // The graduand address starts at 45:27 (INVENTORY.md), which the link carries as t=2727s.
    expect(embed.start).toBe(45 * 60 + 27);
    expect(embed.src).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+\?start=2727$/);
    expect(embed.href).toBe(item.links![0].url);
  });
});
