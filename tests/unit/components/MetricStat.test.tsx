import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricStat } from "@/components/ui/MetricStat";
import { TextWithMetrics } from "@/components/ui/TextWithMetrics";
import { assignMetrics, splitByMetrics } from "@/lib/content/metrics";
import type { Metric } from "@/lib/content/schema";
import { type MetricView, metricView, sourceLabel } from "@/lib/content/sources";

const prs: MetricView = metricView({
  value: "220+",
  label: "pull requests",
  source: "resume-2026",
});
const model: MetricView = metricView({
  value: "7B",
  label: "parameters",
  source: "resume-2026",
  note: "LoRA.",
});

describe("MetricStat", () => {
  it("shows the value and describes the button with the label and source", () => {
    render(<MetricStat metric={model} />);
    expect(screen.getByText("7B")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Source for 7B: parameters" });
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(button).toHaveAttribute("aria-describedby", tooltip.id);
    expect(tooltip).toHaveTextContent("parameters");
    expect(tooltip).toHaveTextContent("LoRA.");
    expect(tooltip).toHaveTextContent(`Source: ${sourceLabel("resume-2026")}`);
  });

  it("is given a public label, never a source id, and rejects an unlabelled id upstream", () => {
    const hidden: Metric = { value: "1", label: "x", source: "_source/private/file.pdf" };
    expect(() => metricView(hidden)).toThrow(/No reader-facing label/);
    expect(prs).not.toHaveProperty("source");
    expect(prs.sourceLabel).toBe(sourceLabel("resume-2026"));
  });
});

describe("TextWithMetrics", () => {
  it("wraps each metric at its first occurrence and keeps the rest of the text", () => {
    const text = "fine-tuned a 7B model (CodeLlama-7B-Instruct) across 220+ pull requests";
    render(<TextWithMetrics text={text} metrics={[prs, model]} />);
    // One button per metric, even though "7B" occurs twice.
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Source for 7B: parameters" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Source for 220+: pull requests" }),
    ).toBeInTheDocument();
    // The surrounding text survives verbatim, split around the two wrapped values.
    expect(screen.getByText("fine-tuned a", { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText("model (CodeLlama-7B-Instruct) across", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("pull requests", { exact: false, selector: "span > *" })).toBeDefined();
  });

  it("renders plain text when no metric occurs", () => {
    render(<TextWithMetrics text="no numbers here" metrics={[prs]} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("no numbers here")).toBeInTheDocument();
  });
});

describe("metric helpers", () => {
  it("splitByMetrics splits in reading order, once per metric", () => {
    const parts = splitByMetrics("a 7B b 220+ c 7B", [prs, model]);
    expect(parts).toEqual(["a ", model, " b ", prs, " c 7B"]);
  });

  it("splitByMetrics moves an overlapped metric without skipping a later one", () => {
    const llama = metricView({ value: "CodeLlama-7B", label: "model", source: "resume-2026" });
    const parts = splitByMetrics("CodeLlama-7B x 220+ y 7B", [llama, model, prs]);
    expect(parts).toEqual([llama, " x ", prs, " y ", model]);
  });

  it("assignMetrics gives each metric to the first text that contains it", () => {
    expect(assignMetrics(["x 220+", "y 7B 220+"], [prs, model])).toEqual([[prs], [model]]);
    expect(assignMetrics(["nothing"], [prs])).toEqual([[]]);
  });
});
