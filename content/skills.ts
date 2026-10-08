/**
 * Controlled skills vocabulary (DESIGN §3.1, §3.2). Every skill tag anywhere in content/ must
 * be an id from this list; a unit test enforces it. Categories follow DESIGN §3.2; the entries
 * are the resume of record's "Technical Skills" lines (revised 2026-09-11) plus the DESIGN
 * seed, so the Session 5 explorer has one stable set of nodes.
 */
import type { Skill } from "@/lib/content/schema";

export const skillCategories = [
  { id: "agentic", label: "Agentic AI & LLM systems" },
  { id: "fullstack", label: "Full-stack & infrastructure" },
  { id: "ml", label: "ML, computer vision & medical imaging" },
  { id: "tooling", label: "Tooling" },
] as const;

export const skills = [
  // Agentic AI, LLM systems & evaluation
  { id: "mcp", label: "MCP", category: "agentic" },
  { id: "agent-loops", label: "Agent loops & tool calling", category: "agentic" },
  { id: "openai-agents-sdk", label: "OpenAI Agents SDK", category: "agentic" },
  { id: "semantic-kernel", label: "Semantic Kernel", category: "agentic" },
  { id: "langchain", label: "LangChain", category: "agentic" },
  { id: "azure-openai", label: "Azure OpenAI", category: "agentic" },
  { id: "gemini-vertex-ai", label: "Gemini / Vertex AI", category: "agentic" },
  { id: "bm25f", label: "BM25F search & query expansion", category: "agentic" },
  { id: "rag", label: "RAG", category: "agentic" },
  { id: "eval-harness", label: "LLM evaluation harnesses", category: "agentic" },
  { id: "ci-gated-validation", label: "CI-gated validation", category: "agentic" },
  { id: "grounding", label: "Grounding & claim verification", category: "agentic" },
  { id: "lora", label: "LoRA fine-tuning", category: "agentic" },
  { id: "mlops", label: "MLOps", category: "agentic" },
  { id: "generative-ai", label: "Generative AI", category: "agentic" },
  // Full-stack & infrastructure
  { id: "python", label: "Python", category: "fullstack" },
  { id: "fastapi", label: "FastAPI", category: "fullstack" },
  { id: "typescript", label: "TypeScript", category: "fullstack" },
  { id: "nextjs", label: "Next.js / React", category: "fullstack" },
  { id: "csharp", label: "C#", category: "fullstack" },
  { id: "cpp", label: "C++", category: "fullstack" },
  { id: "sql", label: "SQL", category: "fullstack" },
  { id: "kql", label: "KQL", category: "fullstack" },
  { id: "rest-apis", label: "REST APIs", category: "fullstack" },
  { id: "docker", label: "Docker & containerization", category: "fullstack" },
  { id: "ci-cd", label: "CI/CD", category: "fullstack" },
  { id: "azure", label: "Azure", category: "fullstack" },
  { id: "azure-devops", label: "Azure DevOps", category: "fullstack" },
  { id: "access-control", label: "Access control & permissions", category: "fullstack" },
  { id: "android", label: "Android (Java)", category: "fullstack" },
  // ML, computer vision & medical imaging
  { id: "pytorch", label: "PyTorch", category: "ml" },
  { id: "tensorflow", label: "TensorFlow", category: "ml" },
  { id: "opencv", label: "OpenCV", category: "ml" },
  { id: "deep-learning", label: "Deep learning", category: "ml" },
  { id: "cnns", label: "CNNs", category: "ml" },
  { id: "computer-vision", label: "Computer vision", category: "ml" },
  { id: "image-classification", label: "Image classification", category: "ml" },
  { id: "segmentation", label: "Segmentation", category: "ml" },
  { id: "medical-imaging", label: "Medical imaging", category: "ml" },
  { id: "anomaly-detection", label: "Anomaly detection", category: "ml" },
  { id: "time-series", label: "Time-series analysis", category: "ml" },
  { id: "xai", label: "Interpretability (XAI)", category: "ml" },
  { id: "signal-processing", label: "Biomedical signals (EEG, capnography)", category: "ml" },
  { id: "embedded", label: "Firmware & sensors", category: "ml" },
  // Tooling
  { id: "claude-code", label: "Claude Code", category: "tooling" },
  { id: "codex", label: "Codex", category: "tooling" },
  { id: "git", label: "Git", category: "tooling" },
  { id: "github-actions", label: "GitHub Actions", category: "tooling" },
] as const satisfies readonly Skill[];

export type SkillId = (typeof skills)[number]["id"];
