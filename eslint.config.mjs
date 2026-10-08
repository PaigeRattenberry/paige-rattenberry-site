import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // Facts reach pages only through the validated loaders (DESIGN 3.1, CLAUDE.md). Raw
    // content modules may be imported by the loaders and by other content modules only.
    files: ["app/**", "components/**", "tests/**", "lib/**"],
    ignores: ["lib/content/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // "@/content/x" or a relative "../content/x"; "@/lib/content/*" is fine.
              regex: "^(@/|(\.\./)+)content/",
              message:
                "Import content through @/lib/content/load (or sourceLabel from @/lib/content/sources) so it passes the zod schema.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_source/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
