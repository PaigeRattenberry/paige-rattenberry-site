/**
 * The one URL-synced single-select filter shared by /projects (`?tag=`) and the /experience
 * explorer (`?skill=`). Pure helpers: reading a known value out of a query string, and pushing
 * a new one with `history.pushState`, which Next.js syncs into `useSearchParams` without a
 * fetch. Client-safe and content-free.
 */

/** The parameter's value when it is one of `known`; anything else means "show everything". */
export function readQueryValue(
  query: string,
  param: string,
  known: ReadonlySet<string>,
): string | null {
  const value = new URLSearchParams(query).get(param);
  return value && known.has(value) ? value : null;
}

/** Push a new value (or remove the parameter for null), keeping every other parameter. */
export function pushQueryValue(param: string, value: string | null): void {
  const next = new URLSearchParams(window.location.search);
  if (value) next.set(param, value);
  else next.delete(param);
  const query = next.toString();
  window.history.pushState(null, "", query ? `?${query}` : window.location.pathname);
}
