# Ultra Cards

An interactive card studio for people who know the feeling they want to convey and still have a blank note. Ultra Cards grew out of building keepsake cards for people close to us. The gift is the moment someone opens the envelope and sees a note that could only have come from the sender.

Pick an occasion, build a card from 36 compositions and preview its reveal. You can write the note yourself or send a short, reviewed brief to Gemini. The assistant offers an editable headline and note, alongside explanations for designs that are available in the studio. Apply the words and the design separately. The classic envelope and recipient link are free.

Signature Reveal adds a gold envelope and illustrated stars. PayPal Sandbox handles buyer approval for the $2.99 USD test order. Vercel functions create and verify the order, and Firestore ties it to the signed-in sender and card. The sender can publish the premium link once the server verifies a final capture. Recipients open the shared card without a studio account.

The hardest parts were letting the AI help without overwriting someone's words and making checkout safe to resume after a cancel, timeout or pending capture. The implementation separates the brief from the published snapshot and separates PayPal approval from verified payment. We learned to design for interrupted payments and to make suggestions reversible in the editor.

Next we would add revocable links and test the gifting flow with more senders and recipients.
