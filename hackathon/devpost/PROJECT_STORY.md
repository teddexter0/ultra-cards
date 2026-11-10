# Ultra Cards

**Draft for review.** The classic studio is the existing release. The AI and checkout story describes the intended hackathon upgrade and requires live verification before it is used as a submission claim.

## Inspiration and problem

A generic message can miss what makes a relationship feel personal. Ultra Cards started with the opening moment of a handcrafted card. The challenge was to make that kind of gesture practical for someone who has a memory and a few minutes, but no design tools or ready-made words.

## Who it serves

Friends, relatives and partners who want to send a memorable birthday, anniversary, Christmas or thank-you card across a distance.

## What exists today

The browser studio turns an occasion and a few recipient details into an editable card. Senders can browse 36 compositions, refine the palette and typography, and share an interactive envelope link or export an HTML keepsake. Accounts can sync drafts through Firebase.

## Hackathon upgrade

The planned walkthrough starts with an occasion, relationship and optional memory. A consent-based Gemini request drafts wording and recommends actual compositions. The sender can apply the wording and design separately, then customize the card in the original editor. The classic envelope remains free. Signature Reveal adds a foil envelope and a burst of illustrated stars. PayPal sandbox approval is followed by server-side capture and verification before the sender can publish the premium recipient link.

## How it was designed

The browser handles the editing and preview. Vercel functions call Gemini and PayPal. Firebase Authentication identifies the sender. Firestore holds the payment status for each signed-in sender and card and the published card snapshot. A recipient can open the snapshot without an account.

## Challenges and next steps

Keeping private draft notes out of recipient links shaped the design. Treating approval, pending payment and completed capture as separate states made recovery part of the checkout flow. The next release milestone is to verify the entire provider-backed journey, including cancellation, then record the genuine demo.
