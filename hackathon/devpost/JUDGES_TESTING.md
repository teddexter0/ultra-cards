# Judge testing

The [existing production studio](https://ultra-cards.vercel.app/) and [public repository](https://github.com/teddexter0/ultra-cards) are available. The new Gemini and PayPal flow is pending deployment and a real provider test. Use this draft after the release URL has been confirmed.

## Existing studio

Start a card as a guest. Use the synthetic names Alex and Sam. Choose Birthday, add a memory about a rainy hike, select a design and preview the envelope. Open it, copy the free link and verify it in a private window. The recipient should see the finished card without signing in.

## Hackathon walkthrough after verification

1. Sign in with a dedicated demo account. Use the credentials supplied privately with the entry if required.
2. Add the synthetic brief, open AI Assist and explicitly consent. Generate a note, apply one catalogue recommendation and keep the wording editable.
3. Preview, choose Signature Reveal and proceed to PayPal using a sandbox buyer. The displayed price is USD 2.99 in test funds.
4. Cancel once and confirm the card is still locked. Reopen checkout and approve. A verified completed capture should unlock Signature Reveal. If pending, use the same-order status control.
5. Publish the premium recipient link and open it signed out. The foil envelope and illustrated stars should appear. Try the reduced-motion preference.

## Local setup after the upgrade is pushed

Use Node 22 and run `npm install --ignore-scripts`, `npm run check`, `npm test`, and `npm run build`. Copy `.env.example` to `.env.local` and set the secrets in that file. Start with `node --env-file=.env.local scripts/serve.mjs` and open http://127.0.0.1:4173. Configure Firebase client auth for the local host and provision credentials for a dedicated Firebase project. Required server values are `GEMINI_API_KEY`, `PAYPAL_SANDBOX_CLIENT_ID`, `PAYPAL_SANDBOX_CLIENT_SECRET`, and `FIREBASE_SERVICE_ACCOUNT_JSON`. The optional `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`.

If the provider is unavailable, the free journey still demonstrates the classic studio. Record actual sandbox and AI results before making either integration a judging claim.
