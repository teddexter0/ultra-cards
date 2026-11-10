import {GiftError, route, services} from '../server/gift-runtime.js';

export default route(async req => {
  const id = new URL(req.url, 'http://localhost').searchParams.get('id');
  if (!/^[a-zA-Z0-9_-]{32}$/.test(id || '')) throw new GiftError(404, 'This Signature Reveal link is invalid.');
  const {db} = await services();
  const row = await db.collection('giftShares').doc(id).get();
  if (!row.exists) throw new GiftError(404, 'This Signature Reveal could not be found.');
  return {card: row.get('card')};
}, 'GET');
