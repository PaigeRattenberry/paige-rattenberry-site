/**
 * Reader-facing label for each source id (DESIGN §3.3). MetricStat shows it in the tooltip,
 * so the dates here are facts and live under content/ with everything else. Every id used
 * anywhere in content/ must appear here: a unit test checks the TypeScript modules, and
 * `sourceLabel()` throws at render for anything the test cannot see.
 */
export const SOURCE_LABELS: Readonly<Record<string, string>> = {
  "resume-2026": "Resume, revised 2026-09-11",
  linkedin: "LinkedIn profile, snapshot of 2026-09-11",
  "stimmap3d-repo": "StimMap3D repository",
  "_source/INVENTORY.md": "Facts confirmed by Paige, 2026-09-08 to 2026-10-06",
  "_source/certifications/giac-gmle-grade-report.pdf": "GIAC GMLE exam grade report",
  "_source/certifications/sans-sec595-certificate.pdf": "SANS SEC595 certificate of completion",
  "_source/thesis/honours-thesis-2022.pdf": "Honours thesis, SFU, 2022",
  "_source/leadership/valedictorian-speech-2022.pdf":
    "Valedictorian address, SFU convocation, October 2022",
  "_source/capstone/sfu-news-article-2022.pdf":
    "SFU School of Engineering Science news article, 19 July 2022",
  "_source/capstone/icames-2022-presentation.pdf":
    "Capstone team's ICAMES 2022 competition presentation",
  "_source/capstone/final-presentation-2022.pdf": "Capstone team's final presentation, SFU, 2022",
  "_source/research/genai-interpretability-review-2024.pdf": "Literature review, 21 April 2024",
  "_source/projects/mse-491-report-2020.pdf": "MSE 491 final report, SFU, December 2020",
  "site-build-record": "This site's planning documents and build logs",
  "giac-gmle-objectives": "GIAC, GMLE certification objectives (giac.org), read 2026-10-05",
  "sans-sec595-course": "SANS, SEC595 course description (sans.org), read 2026-10-05",
};
