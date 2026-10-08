import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** One or two sentences under the title. */
  lede?: ReactNode;
  /** Small mono line above the title: a date, a section, a figure number. */
  kicker?: string;
  children?: ReactNode;
};

/** Page title block: optional mono kicker, serif title, lede in prose width. */
export function PageHeader({ title, lede, kicker, children }: PageHeaderProps) {
  return (
    <div className="max-w-content mx-auto px-5 pt-14 pb-10 sm:px-8 md:pt-20">
      <div className="max-w-prose">
        {kicker ? <p className="mono-label mb-3">{kicker}</p> : null}
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {lede ? <p className="text-ink-2 mt-4 text-lg leading-relaxed">{lede}</p> : null}
        {children}
      </div>
    </div>
  );
}
