# Technology requirement

Draft pending live provider verification.

| Component | Role in the hackathon upgrade |
|---|---|
| Gemini API `generateContent` | Produces an editable headline, note and catalogue recommendations from a consented brief. The default model in the local implementation is Gemini 2.5 Flash-Lite. |
| PayPal JavaScript SDK Buttons | Presents PayPal sandbox approval in the gift flow. |
| PayPal OAuth 2.0 client credentials | Authenticates the server to the sandbox API. |
| PayPal Orders v2 Create, Show and Capture | Creates the sandbox order, captures an approved order and verifies its final payment state. |
| Firebase Admin SDK | Verifies sender identity and stores each card's checkout state and published premium snapshot. |

[Gemini model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite) · [PayPal Checkout](https://developer.paypal.com/checkout/integrate/)
