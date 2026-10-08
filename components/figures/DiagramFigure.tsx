import { Figure } from "@/components/ui/Figure";
import { diagram } from "@/lib/content/load";
import { sourceLabel } from "@/lib/content/sources";

type DiagramFigureProps = {
  /** Id in content/figures.ts. */
  id: string;
  /**
   * Figure number in the page's own sequence (DESIGN §4.3). A string because MDX bodies write
   * `number="2"`: this project's MDX compile drops JSX expression attributes (`number={2}`).
   */
  number: number | string;
};

/**
 * An original flow diagram drawn from steps kept in content/ (DESIGN §3.5: conceptual drawings
 * are labelled illustrations and carry their source). Plain HTML rather than SVG so the labels
 * reflow at every width and take the theme's colours; a four-step linear flow reads left to
 * right from md up, everything else runs top to bottom. Server component, no facts of its own.
 */
export function DiagramFigure({ id, number }: DiagramFigureProps) {
  const d = diagram(id);
  const across = !d.loop && d.steps.length <= 4;
  const n = Number(number);
  if (!Number.isFinite(n))
    throw new Error(`Diagram "${id}": number "${number}" is not a figure number`);
  return (
    <Figure
      number={n}
      caption={d.caption}
      source={`${sourceLabel(d.source)}, ${d.cite}. Illustration.`}
    >
      {/* Prose styles every <ol> and <li> in the body with utilities, which outrank the .flow
          component rules, so the list resets are utilities too. */}
      <ol
        className={[
          "flow my-0! list-none px-5! py-5 sm:px-6! [&>.flow-step]:pl-0! [&>li]:my-0! [&>li]:list-none",
          across ? "flow-across" : "",
          d.loop ? "flow-loop" : "",
        ].join(" ")}
        // Read only inside the md media query in globals.css; below it the flow stays vertical.
        style={across ? ({ "--flow-cols": d.steps.length } as React.CSSProperties) : undefined}
        aria-label={`${d.loop ? "Cycle" : "Sequence"}: ${d.steps.map((s) => s.title).join(", then ")}${d.loop ? ", then back to the start" : ""}`}
      >
        {d.steps.map((step, i) => (
          // Steps are static and ordered, and two may share a title, so the index is the key.
          <li key={i} className="flow-step">
            <span className="flow-marker" aria-hidden="true">
              {i + 1}
            </span>
            <span className="flow-title">{step.title}</span>
            <span className="flow-detail">{step.detail}</span>
          </li>
        ))}
        {d.loop ? (
          <li className="flow-return mono-label pl-[2.55rem]!" aria-hidden="true">
            back to the start
          </li>
        ) : null}
      </ol>
    </Figure>
  );
}
