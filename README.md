# Kelvin Sukhiraja / Afterimage

The portfolio redesign uses Next.js App Router, TypeScript, Tailwind CSS, GSAP/ScrollTrigger, Lenis and Sanity. The existing `studio/` and repository history are retained.

## Development

Use Node 24.x. Run `npm ci`, then `npm run dev` and open http://localhost:3000.
Copy `.env.example` to `.env.local` only if overriding the public Sanity dataset or canonical URL.

- `npm run build` / `npm start`: production build and server.
- `npm run lint`, `npm run typecheck`, `npm test`: frontend checks.
- `npm ci --prefix studio`, then `npm run studio`: existing Sanity Studio.
- `npm run studio:build`: validate the Studio build.
- `npm run studio:deploy` / `npm run studio:schema`: explicit Studio publication commands.

## Content

The frontend reads published content from `mp9gw1i2 / production` on the server, revalidating every 60 seconds. No token is required for this public dataset. Optional private-dataset credentials must use the server-only `SANITY_API_READ_TOKEN`.

Homepage selection is controlled by the ordered `siteSettings.featuredProjects` references in Studio. The first three appear as featured work. The index initially shows ten projects; the remaining projects expand on request. Projects have dynamic routes from their slugs, with document IDs supported for legacy content. Optional media and case-study chapters are omitted when absent.

The original Studio schemas remain intact, with additive fields for case studies, homepage selection, biography, capabilities and social links in `studio/schemaTypes/afterimageFields.ts`. No content is deleted by this migration. Studio deployment is separate from the frontend deployment.

## Deployment and review

The `portfolio-redesign` branch replaces the previous Vite frontend. `vercel.json` sets the Next.js preset, `npm ci`, `npm run build` and `.next` output for this branch. The GitHub-connected Vercel project creates a preview from the branch; `main` remains production until the PR is merged after review.

Set `NEXT_PUBLIC_SITE_URL` to the canonical custom domain if needed. Otherwise Vercel's production domain is used automatically, with the deployment URL as a fallback. Preview deployments are marked noindex and disallow crawling. The old `VITE_*` environment variables are unused by the new frontend.

Review desktop/mobile layout, intro skip and reduced motion, project navigation, Sanity content, image optimization, and the CV download on the preview before merging. The old website can be recovered from Git history; a normal revert of the migration merge provides a rollback.

## Interaction and assets

The ouroboros hero runs on a capped WebGL canvas with a static fallback and reduced-motion support. The intro plays once per tab session and can be skipped; `/?intro=1` replays it for review. The index uses a short image-to-ASCII preview. The Heritage study uses a pink/red tiger with mouse tilt and click poses, independent of its ASCII background.

`ASSETS.md` records visual sources and font licenses. The CV is served from `public/documents/Kelvin-Sukhiraja-CV-2026.pdf`.

Browser checks in `scripts/` use Playwright and an installed Chrome browser, writing local results into ignored `.qa/`. They expect a local server on port 3000. `src/lib/sanity/` contains CMS access; presentation components live in `src/components/`.
