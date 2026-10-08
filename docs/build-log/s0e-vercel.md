# Session 0-E — Connect Vercel

- Date: 2026-09-09 · Branch: s0-spec-amendments · PR: #2

## Goal

Complete prerequisite S0-E (IMPLEMENTATION_PLAN §3): connect the private repo to Vercel so every
later PR has a preview URL to review — while keeping the half-built site private and out of search
results until launch.

## What shipped

Not a build session; a configuration step, recorded here because Session 8 renders this directory as
the site's build story and because two of these settings have to be reversed at launch.

- Vercel Hobby team `paige-rattenberry`, project **`paigerattenberry`**, GitHub App installed against
  `PaigeRattenberry/paigewebsite` only (not all repositories).
- **No production deployment exists.** `paigerattenberry.vercel.app` returns
  `404 DEPLOYMENT_NOT_FOUND`. Three settings hold that:
  1. Production → Branch Tracking = **`launch`**, a branch created at the Session 1 merge commit and
     never pushed to until Session 8.
  2. Build and Deployment → Ignored Build Step = **"Only build pre-production"**.
  3. Deployment Protection → **Vercel Authentication, Standard Protection**.
- Net effect, verified end to end: every branch including `main` deploys as a preview that returns
  `302 → vercel.com/sso-api` to anyone not logged in, and carries `X-Robots-Tag: noindex`.
- Amendments to `DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `SESSION_PROMPTS.md` and `README.md` recording
  the above, and adding the two reversals to Session 8's post-merge steps.

## Decisions and why

- **Privacy by having no production deployment, rather than by protecting one.** Vercel's Hobby plan
  cannot protect a production domain: Vercel Authentication's free scope, *Standard Protection*,
  covers previews and generated URLs but explicitly excludes production. The scope that covers
  production ("All Deployments") is Pro, and Vercel lists private production deployments under a
  $150/month Advanced Deployment Protection add-on. Not worth it for seven sessions, so the site
  simply never produces a production deployment until it is ready to be public.
- **The project was created as an "empty project" with Git attached afterwards, not imported.**
  Importing at `vercel.com/new` always deploys the default branch to production, and Vercel refuses
  to delete the deployment currently serving production — so importing leaves a public deployment
  that cannot be removed. The empty-project route is the only way to reach zero production
  deployments. Cost of that choice: framework detection never runs (see below).
- **Two locks, not one.** Branch Tracking alone would be enough, but a single mis-click at the wrong
  moment would publish the site, so the Ignored Build Step backs it up.
- **`launch` as the production branch** rather than a name that does not exist, so the setting is
  unambiguous and Session 8's promotion is a normal `git push origin main:launch`.

## Skills / tools used

Vercel dashboard; `gh api` to read commit statuses and deployments; `curl -I` to verify response
codes and headers from outside any logged-in session; a throwaway branch with an empty commit as the
end-to-end smoke test.

## What Claude got wrong and how it was caught

- **Sequenced the setup so that the import created a production deployment, then planned to delete
  it.** Vercel does not allow deleting the deployment currently serving production; it only becomes
  deletable once another has replaced it. Caught when the deployment's `⋯` menu had no Delete item.
  The fix was to delete the project and recreate it by the empty-project route — which is why that
  route is now the documented one in S0-E.
- **The first smoke test proved nothing.** A branch was pushed pointing at the already-deployed
  commit `c4e4ccb`; Vercel skips builds for a SHA it has already deployed, so nothing built. Worse,
  GitHub commit statuses are per-SHA rather than per-branch, so an eight-hour-old "Vercel: success"
  from the deleted project appeared on the new branch and read as a pass. Caught because the preview
  URL kept returning 404 while the status said success. Redone with a genuinely new commit.
- **The first real build failed.** Creating an empty project skips framework detection, so Framework
  Preset defaulted to "Other" and the build had no build command. Caught by the failed deployment;
  fixed by setting it to Next.js by hand. Node.js Version confirmed 24.x.
- **Changing the Framework Preset silently reset the Ignored Build Step to "Automatic".** Caught on a
  later screenshot. Re-check that setting after any build-settings edit.

## Paige's review notes

## Screenshots

None. The verification artefacts are response headers rather than pages:

```
preview     302 → vercel.com/sso-api   X-Robots-Tag: noindex
production  404  X-Vercel-Error: DEPLOYMENT_NOT_FOUND
```
