import { PageHeader } from "./PageHeader";
import { Prose } from "./Prose";

type PlaceholderPageProps = {
  title: string;
  /** What this page will hold, in one sentence. */
  lede: string;
  /** Which session fills it in. */
  session: number;
};

/** Session 1 stand-in for a route: title, one sentence, and where the content comes from. */
export function PlaceholderPage({ title, lede, session }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} lede={lede} />
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <Prose>
          <p className="mono-label">Content lands in Session {session} of 8.</p>
        </Prose>
      </div>
    </>
  );
}
