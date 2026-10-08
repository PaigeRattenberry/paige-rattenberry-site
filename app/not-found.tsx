import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { Prose } from "@/components/ui/Prose";

export default function NotFound() {
  return (
    <>
      <PageHeader
        kicker="404"
        title="Page not found"
        lede="There is nothing at this address. The link may be out of date."
      />
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <Prose>
          <p>
            <Link href="/">Go to the home page</Link> or{" "}
            <Link href="/projects">browse projects</Link>.
          </p>
        </Prose>
      </div>
    </>
  );
}
