# Ultra Cards

A free personal greeting-card studio. Twelve original compositions combine with five palettes and four type treatments for **240 design configurations**, with a recent-history shuffle. Inspired by the typography, keepsake galleries and cinematic reveals of earlier personal card projects; no personal photos or private card messages are included in this public repository.

## Run

Requires Node 20+. No npm packages or install step are needed.

```sh
npm run dev
npm run check
npm test
npm run build
```

Open http://127.0.0.1:4173. The production build is written to `dist/`. Vercel serves the media search endpoint from `api/media.js`; the local static server returns a helpful setup message for that endpoint.

## What works without keys

- Guided recipient, occasion, personal-detail, visual and wording editor.
- Editable local template wording, including a laugh/wordplay variation. This is a deterministic template helper, **not an LLM**.
- Twelve scene compositions, 240 palette/type combinations, 3D CSS envelope reveal, subtle tilt, animated motifs, reduced-motion support.
- Photo/video HTTPS links and browser-local image uploads. Uploaded images are resized locally and embedded in downloadable HTML keepsakes.
- Device drafts; portable recipient links containing only the final card in the URL fragment; WhatsApp/native sharing.
- Four-week occasion view; curated Kenya baseline; country holiday feed via Nager.Date; personal annual dates; limited ICS import.

## Accounts and private cloud drafts

Use a **dedicated Firebase project** on the free Spark plan. Serve its public web-app config at `public/firebase-config.json` (copy the shape from `firebase-config.example.json`). Firebase web API keys identify the project; access control comes from Auth and Security Rules. Never commit service-account credentials, refresh tokens, private API keys or personal draft data.

The client loads Firebase 12.5.0 modules from Google's CDN only if a valid config exists. It supports Google sign-in, email/password registration and password reset. Deploy `firestore.rules` before enabling cloud saves. Draft documents live under `users/{uid}/cards/{id}`, and are only accessible to their authenticated owner. The client queries a maximum of 200 documents, merges by update time, and saves explicitly; device photos stay local.

Google Calendar connection is a separate, explicit read-only consent request. Enable the Calendar API, configure Google OAuth branding/audience, authorize the production origin, and complete any required public verification. Tokens stay in memory. The app reads expanded upcoming events from the primary calendar. It does **not** scan when closed or run scheduled reminders. Calendar imports and personal dates stay on the device in this release.

## Free media search

Set `PEXELS_API_KEY` and/or `PIXABAY_API_KEY` in the hosting provider's encrypted environment settings. Do not put them in browser code. Requests are cached; provider credentials stay server-side. The app retains creator/source attribution, exposes provider search links when keys are missing, and reports upstream limits. A public multi-user launch also needs authenticated rate limiting and usage monitoring before enabling unrestricted API proxy access.

## Honest limits

- 240 combinations are derived from 12 compositions, not 240 handcrafted templates.
- Holiday coverage is not an exhaustive official register. Lunar dates, special gazetted holidays and some regional dates require local verification. Kenya baseline is retained when the live feed fails. Mother's/Father's Day use named conventions and vary by country.
- ICS supports one-off dates and simple `FREQ=YEARLY`. Complex recurrence is skipped with a count; timed events use the date written in the ICS file.
- Card links are readable by anyone who receives them, can be forwarded, and cannot be revoked. Their URL fragment is not sent in HTTP requests, but is not encryption. Private draft prompts are excluded. Avoid sensitive notes.
- Share links require hosted HTTPS media. Device images are included in HTML exports, not uploaded. Firebase Storage and video upload hosting are deliberately not provisioned; they may require billing.
- HTML exports keep text and styles locally. Remote fonts, images and videos require internet access. They are not MP4 or PDF exports.
- No messaging is sent automatically. No paid AI service is configured.

## Design and media references

- [Codrops: tactile postcards and shader transitions](https://tympanus.net/codrops/2026/06/09/building-an-interactive-digital-stamp-collection-with-shaders-postcards-and-playful-inspection/) — interaction inspiration; original implementation here uses lightweight CSS rather than copying that project's assets.
- [Pexels licence](https://www.pexels.com/license/) and [API documentation](https://www.pexels.com/api/documentation/).
- [Pixabay API](https://pixabay.com/api/docs/) and [content licence](https://pixabay.com/service/license-summary/).
- [Nager.Date](https://date.nager.at/) and [UN observances](https://www.un.org/en/observances/list-days-weeks).
- [Firebase pricing](https://firebase.google.com/pricing) and [Calendar authorization scopes](https://developers.google.com/workspace/calendar/api/auth).

Individual scene media sources and attribution are defined in `src/engine.js` and displayed on recipient previews. Fonts: DM Sans, Cormorant Garamond, Caveat, Playfair Display and Space Grotesk via Google Fonts.
