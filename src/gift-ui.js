import {accountToken} from './cloud.js';
import {escapeHTML as esc, publicCard, variant} from './engine.js';
import {giftProduct} from './gift-product.js';

const tones = ['Heartfelt', 'Playful', 'Elegant', 'Romantic', 'Nostalgic', 'Funny', 'Formal'];
const actions = {generate: 'Generate or regenerate', rewrite: 'Rewrite', shorten: 'Shorten', expand: 'Expand',
  personalize: 'Make more personal', humor: 'Make more humorous', tone: 'Change tone'};
const options = (values, selected) => values.map(([value, label]) =>
  '<option value="' + esc(value) + '"' + (value === selected ? ' selected' : '') + '>' + esc(label) + '</option>').join('');
const $ = selector => document.querySelector(selector);

async function giftRequest(endpoint, body) {
  const response = await fetch('/api/gift-' + endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + await accountToken()},
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(40000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(result.error || 'The gift service is temporarily unavailable.');
  return result;
}

export function openGiftAssistant(card, {dialog, apply, signIn}) {
  if (!signIn()) return;
  dialog(
    '<div class="eyebrow">THE GIFT STUDIO / AI ASSIST</div><h2>Find the <em>right words.</em></h2>' +
    '<p>Get an editable Gemini draft and suggestions from the real card catalogue.</p>' +
    '<form id="gift-ai-form" class="gift-form"><div class="field-pair"><label>What should Gemini do?<select name="action">' +
    options(Object.entries(actions), 'generate') + '</select></label><label>Tone<select name="tone">' +
    options(tones.map(tone => [tone, tone]), tones.includes(card.tone) ? card.tone : 'Heartfelt') +
    '</select></label></div><div class="field-pair"><label>Length<select name="length">' +
    options(['Short', 'Medium', 'Long'].map(length => [length, length]), 'Medium') +
    '</select></label><label>Relationship<input name="relationship" maxlength="100" value="' + esc(card.relationship) + '"></label></div>' +
    '<label>Interests<input name="interests" maxlength="300" value="' +
    esc([card.interests, card.flowers, card.scenery].filter(Boolean).join(', ').slice(0, 300)) + '"></label>' +
    '<label>Memory or personal detail<textarea name="memory" maxlength="700" rows="3">' +
    esc([card.sharedMemory, card.admiration, card.details].filter(Boolean).join('\n').slice(0, 700)) + '</textarea></label>' +
    '<label>Extra direction<textarea name="instructions" maxlength="400" rows="2">' +
    esc([card.futureWish, card.avoid && 'Avoid: ' + card.avoid].filter(Boolean).join('\n').slice(0, 400)) + '</textarea></label>' +
    '<label class="check gift-consent"><input type="checkbox" name="consent" required> Send the occasion and fields above to Google Gemini. ' +
    'Editing actions also send the current headline and note. Review these fields and leave out sensitive details.</label>' +
    '<button class="primary full" type="submit">Get AI suggestions</button></form>' +
    '<p id="gift-ai-status" role="status" aria-live="polite"></p><div id="gift-ai-results"></div>'
  );
  const form = $('#gift-ai-form');
  const status = $('#gift-ai-status');
  const output = $('#gift-ai-results');
  form.onsubmit = async event => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    const editing = fields.action !== 'generate';
    if (editing && card.message?.length > 2400) {
      status.textContent = 'The note is longer than 2,400 characters. Trim it in the editor before using an AI editing action.';
      return;
    }
    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Writing and looking through the card catalogue…';
    output.replaceChildren();
    try {
      const suggestion = await giftRequest('ai', {...fields, consent: fields.consent === 'on',
        occasion: card.customOccasion?.trim() || card.occasion,
        title: editing ? card.title : '', message: editing ? card.message : ''});
      status.textContent = 'Suggestion ready. Choose what to use.';
      output.innerHTML = '<section class="gift-result"><h3>' + esc(suggestion.title) + '</h3><p class="gift-note">' +
        esc(suggestion.message) + '</p><button type="button" class="outline" id="gift-apply-words">Use this wording</button>' +
        '<h3>Worlds that fit</h3><ul class="gift-recommendations">' + suggestion.recommendations.map(({variant: id, reason}) =>
          '<li><strong>' + esc(variant(id).name) + '</strong><p>' + esc(reason) +
          '</p><button type="button" class="outline" data-gift-world="' + id + '">Use this design</button></li>').join('') +
        '</ul><p><strong>Free card</strong> · Edit, open and share with the classic envelope.</p><p><strong>' + esc(giftProduct.name) +
        ' · $' + giftProduct.price + ' sandbox USD</strong> · ' + esc(giftProduct.description) + '</p>' +
        (suggestion.giftAdvice ? '<p class="small-note">Gemini suggestion: ' + esc(suggestion.giftAdvice) + '</p>' : '') + '</section>';
      $('#gift-apply-words').onclick = event => {
        apply({title: suggestion.title, message: suggestion.message});
        event.currentTarget.textContent = 'Wording applied';
        status.textContent = 'Wording applied. You can still edit it before sharing.';
      };
      output.querySelectorAll('[data-gift-world]').forEach(control => control.onclick = () => {
        apply({variant: Number(control.dataset.giftWorld), designChosen: true, color: ''});
        status.textContent = variant(Number(control.dataset.giftWorld)).name + ' applied.';
      });
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
}

let sdk;
function paypalSDK(clientId, currency) {
  if (!sdk) sdk = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({'client-id': clientId, currency, components: 'buttons', intent: 'capture', 'disable-funding': 'card,paylater,credit'});
    script.src = 'https://www.paypal.com/sdk/js?' + params;
    const failed = () => {
      clearTimeout(timer);
      script.remove();
      reject(Error('The PayPal checkout could not load. Reopen this panel to retry.'));
    };
    const timer = setTimeout(failed, 15000);
    script.onload = () => {
      clearTimeout(timer);
      if (window.paypal?.Buttons) resolve(window.paypal);
      else failed();
    };
    script.onerror = failed;
    document.head.append(script);
  }).catch(error => {sdk = null; throw error;});
  return sdk;
}

export async function openGiftCheckout(card, {dialog, signIn, preview, share}) {
  if (!signIn()) return;
  dialog(
    '<div class="eyebrow">THE GIFT STUDIO / PAYPAL SANDBOX</div><h2>A <em>Signature Reveal.</em></h2>' +
    '<p>' + esc(giftProduct.description) + '</p><p><strong>$' + giftProduct.price +
    ' USD sandbox</strong> · Use a PayPal sandbox buyer account. Test funds only.</p>' +
    '<p id="gift-checkout-status" role="status" aria-live="polite">Checking this card’s purchase status…</p>' +
    '<div id="gift-paypal-buttons"></div><button type="button" class="outline full" id="gift-check-status" hidden>Check this order again</button>' +
    '<div id="gift-unlocked" hidden><button type="button" class="outline full" id="gift-preview">Preview Signature Reveal</button>' +
    '<button type="button" class="primary full" id="gift-publish">Create the premium link</button>' +
    '<p class="small-note">This publishes only the finished card. Anyone with the link can view and forward that snapshot.</p></div>'
  );
  const status = $('#gift-checkout-status');
  const buttons = $('#gift-paypal-buttons');
  const retry = $('#gift-check-status');
  const unlocked = $('#gift-unlocked');
  const request = (action, extra) => giftRequest('checkout', {action, cardId: card.id, ...extra});
  const paid = () => {
    status.textContent = 'PayPal verified the sandbox payment. Signature Reveal is unlocked for this card.';
    unlocked.hidden = false;
    buttons.hidden = true;
    retry.hidden = true;
  };
  const verify = async orderId => {
    retry.disabled = true;
    status.textContent = 'Checking the order with PayPal…';
    try {
      const result = await request('capture', orderId ? {orderId} : undefined);
      if (result.status === 'paid') paid();
      else if (result.status === 'pending') {
        buttons.hidden = true;
        status.textContent = 'PayPal is still processing the payment. Check this same order again shortly.';
      } else if (result.status === 'failed') {
        status.textContent = 'This order failed or expired. Reopen checkout to try again.';
      } else status.textContent = 'This order is still waiting for PayPal approval.';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      retry.disabled = false;
    }
  };
  retry.onclick = () => verify();
  $('#gift-preview').onclick = preview;
  $('#gift-publish').onclick = async event => {
    const button = event.currentTarget;
    if (card.localPhoto) {
      status.textContent = 'Replace the device photo with an HTTPS image before sharing a link.';
      return;
    }
    button.disabled = true;
    status.textContent = 'Preparing your recipient link…';
    try {
      const {shareId} = await request('publish', {card: publicCard(card)});
      if (status.isConnected && $('#modal').open) share(location.origin + '/#signature=' + shareId);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
  try {
    const state = await request('status');
    if (state.status === 'paid') return paid();
    retry.hidden = !state.hasOrder;
    if (state.status === 'pending') {
      status.textContent = 'PayPal is processing the original order. Check it again before starting another checkout.';
      return;
    }
    const {clientId, currency} = await request('config');
    const paypal = await paypalSDK(clientId, currency);
    if (!buttons.isConnected || !$('#modal').open) return;
    await paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
      createOrder: async () => {
        const order = await request('create');
        if (order.orderId) {
          retry.hidden = false;
          return order.orderId;
        }
        if (order.status === 'paid') paid();
        else status.textContent = 'An existing order is pending. Check that order again.';
        throw Error('An existing order already covers this card.');
      },
      onApprove: ({orderID}) => verify(orderID),
      onCancel: () => {status.textContent = 'Checkout canceled. Your card is ready whenever you want to return.';},
      onError: () => {
        if (unlocked.hidden) status.textContent = 'PayPal could not finish checkout. Retry or check your existing order.';
      },
    }).render(buttons);
    status.textContent = state.hasOrder ? 'Continue your existing checkout or check its status.' : 'Ready when you are.';
  } catch (error) {
    status.textContent = error.message;
  }
}

export async function getSignature(id) {
  const response = await fetch('/api/gift-share?id=' + encodeURIComponent(id), {signal: AbortSignal.timeout(12000)});
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.card) throw Error(result.error || 'This Signature Reveal is unavailable.');
  return publicCard(result.card);
}
