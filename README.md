# Ultra Cards

A free personal greeting-card studio. Thirty-six original compositions combine with five palettes and four type treatments for **720 design configurations**, with a recent-history shuffle. Inspired by the typography, keepsake galleries and cinematic reveals of earlier personal card projects; no personal photos or private card messages are included in this public repository.

## Run

Requires Node 22. Install the pinned dependencies with `npm install --ignore-scripts` before building.

```sh
npm install --ignore-scripts
npm run dev
npm run check
npm test
npm run build
```

Open http://127.0.0.1:4173. The production build is written to `dist/`. Vercel serves the media search endpoint from `api/media.js`; the local static server returns a helpful setup message for that endpoint.

## What works without keys

- Guided recipient, occasion, personal-detail, visual and wording editor.
- Editable local template wording, including a laugh/wordplay variation. This is a deterministic template helper, **not an LLM**.
- Thirty-six scene compositions, 720 palette/type combinations, 3D CSS envelope reveal, subtle tilt, animated motifs, reduced-motion support.
- Photo/video HTTPS links and browser-local image uploads. Uploaded images are resized locally and embedded in downloadable HTML keepsakes.
- Device drafts; portable recipient links containing only the final card in the URL fragment; WhatsApp/native sharing.
- Four-week occasion view; curated Kenya baseline; country and regional holiday feed via date-holidays; personal annual dates; limited ICS import.

## Accounts and private cloud drafts

Use a **dedicated Firebase project** on the free Spark plan. Serve its public web-app config at `public/firebase-config.json` (copy the shape from `firebase-config.example.json`). Firebase web API keys identify the project; access control comes from Auth and Security Rules. Never commit service-account credentials, refresh tokens, private API keys or personal draft data.

The client loads a same-origin Firebase 12.5.0 bundle when a valid config exists. It supports Google sign-in, email/password registration and password reset. Deploy `firestore.rules` before enabling cloud saves. Draft documents live under `users/{uid}/cards/{id}`, and are only accessible to their authenticated owner. The client queries a maximum of 200 documents, merges by update time, and saves explicitly; device photos stay local.

Google Calendar connection is a separate, explicit read-only consent request. Enable the Calendar API, configure Google OAuth branding/audience, authorize the production origin, and complete any required public verification. Tokens stay in memory. The app reads expanded upcoming birthdays from the primary calendar, including native Google birthday events. A GitHub Actions job refreshes public holiday data daily at 06:00 Africa/Nairobi, including while the app is closed. This does not send notifications or scan private birthdays in the background. Calendar imports and personal dates stay on the device in this release.

## Gemini and PayPal Sandbox

Configure the following server variables on the existing Vercel project. For local testing, copy `.env.example` to `.env.local`, supply your own values, and run `node --env-file=.env.local scripts/serve.mjs` after building. Use only the matching Firebase demo project and PayPal sandbox credentials.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Enables Gemini Assist. |
| `GEMINI_MODEL` | Optional model override. Default is `gemini-2.5-flash-lite`. |
| `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET` | PayPal Sandbox REST app credentials. Only the client ID is returned to the signed-in checkout UI. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin service account JSON for the same project as the web config. Required for ID-token verification, server-side rate limits, checkout and premium shares. |

Gemini receives the approved brief and, for editing actions, the current headline and note. Suggestions are applied separately from the design choice. The classic card stays free. Signature Reveal costs $2.99 USD in sandbox funds and requires a completed capture with matching order details. The server stores the order and entitlement per account and card. Premium links use an opaque ID and are readable by anyone with that link.

See the [hackathon changelog](docs/HACKATHON_CHANGELOG.md) and [judge instructions](hackathon/devpost/JUDGES_TESTING.md).

## Free media search

Wikimedia Commons photo search works without a key and includes licence attribution. For optional Pexels/Pixabay photo and video search, set `PEXELS_API_KEY` and/or `PIXABAY_API_KEY` in the hosting provider's encrypted environment settings. Do not put them in browser code. Requests are cached; provider credentials stay server-side. The app retains creator/source attribution, exposes provider search links when keys are missing, and reports upstream limits. A public multi-user launch also needs authenticated rate limiting and usage monitoring before enabling unrestricted API proxy access.

## Honest limits

- 720 combinations are derived from 36 compositions, not 720 handcrafted templates.
- Holiday coverage is not an exhaustive official register. Lunar dates, special gazetted holidays and some regional dates require local verification. Kenya baseline is retained when the live feed fails. Mother's/Father's Day use named conventions and vary by country.
- ICS supports one-off dates and simple `FREQ=YEARLY`. Complex recurrence is skipped with a count; timed events use the date written in the ICS file.
- Card links are readable by anyone who receives them, can be forwarded, and cannot be revoked. Their URL fragment is not sent in HTTP requests, but is not encryption. Private draft prompts are excluded. Avoid sensitive notes.
- Share links require hosted HTTPS media. Device images are included in HTML exports, not uploaded. Firebase Storage and video upload hosting are deliberately not provisioned; they may require billing.
- HTML exports keep text and styles locally. Remote fonts, images and videos require internet access. They are not MP4 or PDF exports.
- No messaging is sent automatically. Gemini and sandbox checkout require explicit server configuration.

## Design and media references

- [Codrops: tactile postcards and shader transitions](https://tympanus.net/codrops/2026/06/09/building-an-interactive-digital-stamp-collection-with-shaders-postcards-and-playful-inspection/) — interaction inspiration; original implementation here uses lightweight CSS rather than copying that project's assets.
- [Pexels licence](https://www.pexels.com/license/) and [API documentation](https://www.pexels.com/api/documentation/).
- [Pixabay API](https://pixabay.com/api/docs/) and [content licence](https://pixabay.com/service/license-summary/).
- [Nager.Date](https://date.nager.at/) and [UN observances](https://www.un.org/en/observances/list-days-weeks).
- [Firebase pricing](https://firebase.google.com/pricing) and [Calendar authorization scopes](https://developers.google.com/workspace/calendar/api/auth).

Individual scene media sources and attribution are defined in `src/engine.js` and displayed on recipient previews. Fonts: Manrope, Allura, DM Sans, Cormorant Garamond, Caveat, Playfair Display and Space Grotesk via Google Fonts.

## Current release

- New ribbon identity, larger typography, calligraphy, animated scene catalogue and mobile layouts.
- 36 compositions and 720 browsable palette/type configurations.
- Explicitly remembered recipient preferences, a live brief and private cloud profile storage.
- 250 countries/territories selectable, with dataset coverage shown honestly. Regions are available where the holiday engine provides them.
- Google and email/password login, production domain authorization and owner-only Firestore rules.
- Dedicated Spark project: ultra-cards-c2e49; Standard Firestore database in africa-south1.
- The daily public radar workflow writes only public dates. It never stores calendar tokens, names, draft notes or location coordinates.

### Data attribution

Holiday data is adapted from [date-holidays](https://github.com/commenthol/date-holidays), copyright commenthol and contributors, licensed CC BY 3.0. Generated date records are shortened to the four-week look-ahead; the software is MIT-licensed. Public dates remain planning aids; local authorities and gazetted updates take precedence.
