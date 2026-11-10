# PayPal AI Hackathon changelog

The public branch starts with `121ab8a` (November 2, 2026, README only), followed by `fbb58f0` (November 2, 2026, first Ultra Cards studio with 240 design combinations). The inspected history has no pre-October 1 commits. Earlier personal cards inspired the studio, but the repository does not establish when those separate projects were made or what code they shared.

The hackathon build preserves the free editor, envelope reveal, device drafts, recipient links and HTML exports. Studio work expands the catalogue to 36 compositions and 720 combinations and adds private Firebase accounts and remembered recipients. The new gifting flow adds explicit Gemini consent, editable draft suggestions and real catalogue recommendations. PayPal Sandbox Orders v2 provides an optional $2.99 USD test checkout for Signature Reveal. A matching final capture is required before the server will publish a premium recipient snapshot.

The regression suite covers card creation and sharing as well as simulated provider responses, payment state transitions and cross-account denial. Provider-backed results and deployment status belong in the release and demonstration evidence once verified.
