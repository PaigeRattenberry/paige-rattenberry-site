/**
 * Certifications (DESIGN §3.1). GMLE wording from the resume of record; the exam figures from
 * the GIAC grade report and the SEC595 facts from the SANS certificate, both staged in
 * _source/certifications (facts only; the files are never published). Exam and course coverage
 * from the official GIAC and SANS pages (URLs below), read 2026-10-05. Coursera dates are the
 * settled facts in _source/INVENTORY.md. `detail` is what /experience shows; `resumeDetail` is
 * the shorter line the resume prints.
 */
import type { Certification } from "@/lib/content/schema";

const GMLE_REPORT = "_source/certifications/giac-gmle-grade-report.pdf";
const SEC595_CERT = "_source/certifications/sans-sec595-certificate.pdf";
/** Read 2026-10-05: https://www.giac.org/certifications/machine-learning-engineer-gmle/ */
const GMLE_OBJECTIVES = "giac-gmle-objectives";
/** Read 2026-10-05: https://www.sans.org/cyber-security-courses/applied-data-science-machine-learning/ */
const SEC595_COURSE = "sans-sec595-course";

export const certifications = [
  {
    id: "gmle",
    name: "GIAC Machine Learning Engineer (GMLE)",
    issuer: "GIAC/SANS.edu",
    dates: "Dec 2024 – Feb 2025",
    periods: [{ start: "2024-12", end: "2025-02" }],
    /**
     * The exam's coverage is GIAC's list of its ten certification objectives; the ratings and
     * the CyberLive clause are the grade report's (GIAC's page lists GMLE under CyberLive but
     * does not say the exam includes CyberLive tasks; the report rates four CyberLive practical
     * domains).
     */
    detail:
      "Scored 99%, with the top rating in 13 of 14 domains, earning a GIAC Advisory Board invitation. The exam's ten objectives span statistics, probability and Bayes' theorem, data acquisition and Python (NumPy, Pandas, TensorFlow), supervised learning, clustering, regression, neural networks and CNNs, and autoencoders for anomaly detection, applied to threat hunting and security monitoring; the exam also scored hands-on CyberLive tasks. Via SANS SEC595, applying MLOps practices to malware, anomaly and fraud-detection models.",
    /** The resume line minus the name, issuer and dates the fields above already carry. */
    resumeDetail:
      "Scored 99%, with the top rating in 13 of 14 domains, earning a GIAC Advisory Board invitation; via SANS SEC595, applying MLOps practices to malware, anomaly and fraud-detection models.",
    metrics: [
      {
        value: "99%",
        label: "GMLE exam score",
        source: GMLE_REPORT,
        note: "82 questions, all answered; minimum passing score 65%; finished 26 February 2025.",
      },
      {
        value: "13 of 14",
        label: "exam domains rated five of five",
        source: GMLE_REPORT,
        note: "Every domain but Anomaly Detection and Optimization, rated four of five. Four of the fourteen are CyberLive practical domains.",
      },
      {
        value: "ten",
        label: "certification objectives GIAC lists for the GMLE exam",
        source: GMLE_OBJECTIVES,
        note: "Read on giac.org on 2026-10-05.",
      },
    ],
    source: "resume-2026",
  },
  {
    id: "sec595",
    name: "SEC595: Applied Data Science & AI/Machine Learning for Cybersecurity Professionals",
    /**
     * Taken for credit through SANS.edu's graduate program (Paige, 2026-09-12; matches the
     * LinkedIn Education entry). The certificate itself names only the SANS OnDemand program.
     */
    issuer: "SANS Technology Institute",
    dates: "Completed 9 Jan 2025",
    periods: [{ start: "2024-12", end: "2025-01" }],
    detail:
      "The course behind the GMLE certification, completed for 36 CPE credits. Its six sections apply statistics, trees, forests and clustering, deep learning and autoencoders to security data, through to deploying models in containers.",
    resumeDetail: "The course behind the GMLE certification, completed for 36 CPE credits.",
    metrics: [
      { value: "36", label: "CPE credits", source: SEC595_CERT },
      { value: "six", label: "sections of the SEC595 course", source: SEC595_COURSE },
    ],
    source: SEC595_CERT,
  },
  {
    id: "coursera-multimodal",
    name: "Multi-Modal AI specialization",
    issuer: "Coursera",
    dates: "2021 – 2022",
    periods: [{ start: "2021-12", end: "2022-01" }],
    metrics: [],
    source: "_source/INVENTORY.md",
  },
  {
    id: "coursera-deep-learning",
    name: "Deep Learning specialization",
    issuer: "Coursera",
    dates: "Dec 2021",
    periods: [{ start: "2021-12", end: "2021-12" }],
    metrics: [],
    source: "_source/INVENTORY.md",
  },
  {
    id: "coursera-nlp",
    name: "Natural Language Processing specialization",
    issuer: "Coursera",
    dates: "Jan 2022",
    periods: [{ start: "2022-01", end: "2022-01" }],
    metrics: [],
    source: "_source/INVENTORY.md",
  },
  {
    id: "coursera-ai-for-medicine",
    name: "AI for Medicine specialization",
    issuer: "Coursera",
    dates: "Jan 2022",
    periods: [{ start: "2022-01", end: "2022-01" }],
    metrics: [],
    source: "_source/INVENTORY.md",
  },
  {
    id: "google-genai-intensive",
    name: "Google 5-Day Gen AI Intensive Course Certificate",
    issuer: "Google / Kaggle",
    /** Month confirmed by Paige 2026-09-13 (MentalWell, its capstone, is dated the same). */
    dates: "Apr 2025",
    periods: [{ start: "2025-04", end: "2025-04" }],
    metrics: [],
    source: "linkedin",
  },
] as const satisfies readonly Certification[];
