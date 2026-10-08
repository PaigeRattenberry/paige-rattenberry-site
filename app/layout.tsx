import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { MetricTooltips } from "@/components/ui/MetricTooltips";
import { profile } from "@/lib/content/load";
import { SITE_URL } from "@/lib/site";

/**
 * The three families of DESIGN §4.1, from the files scripts/build-fonts.mjs writes to app/fonts/
 * (the latin subset with the weight axis limited to what the pages draw; see that script and
 * app/fonts/manifest.json). Each `weight` and `unicode-range` below must be typed as a literal,
 * because the font loader reads its arguments at compile time; tests/unit/fonts.test.ts holds
 * them to the manifest. The "extras" faces hold the few body-text characters (and, since
 * Session 8, code-text characters) outside the latin subset. The Inter extras lead the body
 * stack and the mono extras the mono stack (app/globals.css); they are not preloaded, and their
 * unicode-range keeps a page without those characters from ever requesting them.
 *
 * The font loader names each @font-face family after its const, so the serif's const avoids
 * Source Serif 4's Reserved Font Name, which the derivative's name table no longer carries either.
 */
const siteSerif = localFont({
  src: "./fonts/serif.woff2",
  variable: "--font-source-serif",
  weight: "400 500",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const inter = localFont({
  src: "./fonts/inter.woff2",
  variable: "--font-inter",
  weight: "400 700",
  display: "swap",
  adjustFontFallback: "Arial",
});

const jetbrainsMono = localFont({
  src: "./fonts/mono.woff2",
  variable: "--font-jetbrains-mono",
  weight: "400 700",
  display: "swap",
  adjustFontFallback: false,
});

const interLatinExtExtras = localFont({
  src: "./fonts/inter-latin-ext-extras.woff2",
  variable: "--font-inter-latin-ext",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0107, U+011F, U+0192" }],
});

const interGreekExtras = localFont({
  src: "./fonts/inter-greek-extras.woff2",
  variable: "--font-inter-greek",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+03C6" }],
});

const monoLatinExtExtras = localFont({
  src: "./fonts/mono-latin-ext-extras.woff2",
  variable: "--font-mono-latin-ext",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0107, U+011F, U+0192" }],
});

const fontVariables = [
  siteSerif,
  inter,
  jetbrainsMono,
  interLatinExtExtras,
  interGreekExtras,
  monoLatinExtExtras,
]
  .map((font) => font.variable)
  .join(" ");

/**
 * Site-wide metadata (DESIGN §5.5). `metadataBase` makes every relative URL below and in the
 * pages absolute; the Open Graph image comes from app/opengraph-image.tsx (and the per-project
 * one from app/projects/[slug]/opengraph-image.tsx), which Next wires in by file convention.
 * Twitter falls back to the Open Graph title, description and image; only the card type is
 * set here. Each page sets its own title and description.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: `${profile.name}: ${profile.role}. Evaluation harnesses, source-traced retrieval and interpretability research for AI systems, and how this site was built with Claude Code.`,
  openGraph: {
    type: "website",
    siteName: profile.name,
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <ThemeProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <MetricTooltips />
        </ThemeProvider>
      </body>
    </html>
  );
}
