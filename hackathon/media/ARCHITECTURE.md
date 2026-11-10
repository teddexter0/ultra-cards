# Hackathon architecture

This diagram describes the implementation intended for the hackathon release. The deployed provider flow remains pending verification.

```mermaid
flowchart TD
  B["Sender’s card editor"] --> A["AI endpoint"]
  B --> C["Checkout endpoint"]
  A --> G["Gemini API"]
  A --> F["Firebase Authentication and Firestore"]
  C --> F
  C --> P["PayPal Orders v2 sandbox"]
  C --> S["Published recipient snapshot"]
  R["Recipient with share link"] --> S
```

The AI endpoint receives only the consented brief. The checkout endpoint uses the authenticated sender and card ID to load the server-owned order. A verified final capture is required before publishing the unlisted premium snapshot.
