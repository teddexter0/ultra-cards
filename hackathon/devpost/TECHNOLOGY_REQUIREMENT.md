# Technology requirements

- PayPal JavaScript SDK Buttons provides the sandbox buyer approval UI. The server uses PayPal OAuth 2.0 client credentials and Orders v2 to create, retrieve and capture orders. Amount, currency, order ID, invoice and final capture are checked before the premium link can be published.
- Gemini API `generateContent` defaults to `gemini-2.5-flash-lite`. It generates editable greeting text and ranks scenes from the existing catalogue. The request requires consent, a signed-in account and a bounded brief.
- Firebase Authentication identifies the sender. Firestore stores owner-specific checkout state and share snapshots, and enforces request limits through server transactions.

[PayPal integration guide](https://developer.paypal.com/checkout/integrate/)
