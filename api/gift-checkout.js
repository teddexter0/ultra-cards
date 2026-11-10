import {randomBytes, randomUUID} from 'node:crypto';
import {publicCard} from '../src/engine.js';
import {giftProduct} from '../src/gift-product.js';
import {GiftError, rateLimit, route, signedIn} from '../server/gift-runtime.js';
import {checkCapture, checkOrder, newOrder, orderRequest, paypalConfig} from '../server/gift-paypal.js';

const cardIdPattern = /^[a-zA-Z0-9_-]{8,80}$/;
const orderPattern = /^[A-Z0-9]{10,32}$/;

export function checkoutHandler({authenticate = signedIn, limit = rateLimit, paypal = orderRequest, config = paypalConfig} = {}) {
  return route(async (req, body) => {
  const {action, cardId} = body;
  if (typeof cardId !== 'string' || !cardIdPattern.test(cardId) ||
      !['status', 'config', 'create', 'capture', 'publish'].includes(action)) {
    throw new GiftError(400, 'Choose a valid card and checkout action.');
  }
  const {db, uid} = await authenticate(req);
  const ref = db.collection('users').doc(uid).collection('giftOrders').doc(cardId);
  const current = (await ref.get()).data();
  if (action === 'status') return {status: current?.status || 'free', hasOrder: !!current?.orderId};
  if (action === 'publish') {
    if (current?.status !== 'paid') throw new GiftError(403, 'Verify your sandbox checkout before publishing Signature Reveal.');
    if (!body.card || typeof body.card !== 'object' || Array.isArray(body.card) ||
        !['to', 'from', 'title', 'message'].every(key => typeof body.card[key] === 'string' && body.card[key].trim())) {
      throw new GiftError(400, 'Add the recipient, sender, headline and note before sharing.');
    }
    await limit(db, uid, 'publish', 15, 150);
    const snapshot = publicCard(body.card);
    snapshot.mediaUrl = snapshot.mediaUrl.slice(0, 2000);
    snapshot.creditUrl = snapshot.creditUrl.slice(0, 2000);
    const shareId = randomBytes(24).toString('base64url');
    await db.collection('giftShares').doc(shareId).create({card: snapshot, createdAt: new Date()});
    return {shareId};
  }
  if (action === 'config') {
    const {clientId} = config();
    return {clientId, currency: giftProduct.currency};
  }
  if (current?.status === 'paid') return {status: 'paid'};
  await limit(db, uid, 'checkout', 30, 200);
  if (action === 'create') {
    config();
    const candidate = {invoiceId: randomUUID(), captureRequestId: randomUUID(), price: giftProduct.price,
      currency: giftProduct.currency, status: 'created', createdAt: Date.now()};
    const row = await db.runTransaction(async tx => {
      const existing = (await tx.get(ref)).data();
      // PayPal retains Orders idempotency keys for at least six hours. Stop
      // retries of an ambiguous creation well before its key can expire.
      if (existing?.status === 'created' && !existing.orderId && Date.now() - existing.createdAt > 60 * 60 * 1000) {
        throw new GiftError(409, 'This checkout could not be recovered. Use a fresh card to start another order.');
      }
      if (existing && existing.status !== 'failed') return existing;
      tx.set(ref, candidate);
      return candidate;
    });
    if (['paid', 'pending'].includes(row.status)) return {status: row.status};
    if (row.orderId) return {status: 'created', orderId: row.orderId};
    const result = await paypal('', {method: 'POST', requestId: row.invoiceId, body: newOrder(row.invoiceId)});
    if (!orderPattern.test(result.id || '')) throw new GiftError(502, 'PayPal did not return a valid sandbox order.');
    await db.runTransaction(async tx => {
      const existing = (await tx.get(ref)).data();
      if (existing?.invoiceId !== row.invoiceId || (existing.orderId && existing.orderId !== result.id)) {
        throw new GiftError(409, 'Checkout changed. Reopen the checkout panel.');
      }
      if (!existing.orderId) tx.update(ref, {orderId: result.id});
    });
    return {status: 'created', orderId: result.id};
  }
  if (!current?.orderId || (body.orderId !== undefined && body.orderId !== current.orderId)) {
    throw new GiftError(409, 'This card does not have that PayPal order.');
  }
  const path = '/' + current.orderId;
  let order = await paypal(path);
  if (order.status === 'APPROVED') {
    checkOrder(order, current);
    await paypal(path + '/capture', {method: 'POST', requestId: current.captureRequestId, body: {}});
    order = await paypal(path);
  }
  const result = checkCapture(order, current);
  return db.runTransaction(async tx => {
    const latest = (await tx.get(ref)).data();
    if (latest?.orderId !== current.orderId) throw new GiftError(409, 'Checkout changed. Reopen the checkout panel.');
    if (latest.status === 'paid') return {status: 'paid'};
    if (result.status !== 'awaiting-approval') tx.update(ref, {...result, checkedAt: new Date()});
    return {status: result.status};
  });
  });
}

export default checkoutHandler();
