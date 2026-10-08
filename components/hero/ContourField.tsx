import type { ContourLevel } from "./contour";

type ContourFieldProps = {
  levels: ContourLevel[];
  width: number;
  height: number;
  className?: string;
};

/** Static, decorative iso-lines rendered on the server. */
export function ContourField({ levels, width, height, className = "" }: ContourFieldProps) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-motion="static"
      data-testid="contour-field"
      className={className}
      fill="none"
      stroke="var(--accent)"
      strokeOpacity="var(--contour-opacity)"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {levels.map((level, i) => {
        return (
          <g key={level.value} className="contour-level">
            <path d={level.d} strokeWidth={i % 3 === 0 ? 1.4 : 0.9} />
          </g>
        );
      })}
    </svg>
  );
}
