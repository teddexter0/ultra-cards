import {giftProduct} from '../src/gift-product.js';
import {GiftError} from './gift-runtime.js';

const sandbox = 'https://api-m.sandbox.paypal.com';
let cachedToken;

export function paypalConfig() {
  const clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
  const secret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
  if (!clientId || !secret) throw new GiftError(503, 'PayPal sandbox is awaiting server configuration.');
  return {clientId, secret};
}

async function token() {
  const {clientId, secret} = paypalConfig();
  if (cachedToken?.until > Date.now() && cachedToken.clientId === clientId) return cachedToken.value;
  const response = await paypalFetch('/v1/oauth2/token', {
    method: 'POST',
    headers: {Authorization: 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded'},
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new GiftError(502, 'PayPal sandbox authentication failed.');
  const data = await response.json();
  if (!data.access_token) throw new GiftError(502, 'PayPal sandbox did not return a session.');
  cachedToken = {clientId, value: data.access_token, until: Date.now() + Math.max(0, Number(data.expires_in) - 60) * 1000};
  return cachedToken.value;
}

async function paypalFetch(path, options) {
  try {
    return await fetch(sandbox + path, {...options, signal: AbortSignal.timeout(8000)});
  } catch {
    throw new GiftError(502, 'PayPal sandbox did not respond. Check the same checkout again before retrying.');
  }
}

export async function orderRequest(path, {method = 'GET', requestId, body} = {}) {
  const headers = {Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json', Prefer: 'return=representation'};
  if (requestId) headers['PayPal-Request-Id'] = requestId;
  const response = await paypalFetch('/v2/checkout/orders' + path, {method, headers, body: body ? JSON.stringify(body) : undefined});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issue = data.details?.[0]?.issue;
    if (issue === 'ORDER_ALREADY_CAPTURED') return orderRequest(path.replace(/\/capture$/, ''));
    if (issue === 'INSTRUMENT_DECLINED') throw new GiftError(422, 'PayPal declined that sandbox payment method. Try a different sandbox funding source.');
    if (issue === 'ORDER_NOT_APPROVED') throw new GiftError(409, 'Approve the payment in PayPal first.');
    if (response.status === 404 && method === 'GET') throw new GiftError(404, 'PayPal could not find this sandbox order.');
    console.warn('PayPal order request returned', response.status);
    throw new GiftError(502, 'PayPal could not complete that request. Check the same checkout again.');
  }
  return data;
}

export function newOrder(invoiceId) {
  return {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: giftProduct.sku,
      invoice_id: invoiceId,
      description: giftProduct.name,
      amount: {currency_code: giftProduct.currency, value: giftProduct.price},
    }],
    payment_source: {paypal: {experience_context: {shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW'}}},
  };
}

export function checkOrder(order, row) {
  const units = order.purchase_units || [];
  const unit = units[0];
  const matchesPrice = amount => amount?.currency_code === row.currency && amount?.value === row.price;
  if (order.id !== row.orderId || units.length !== 1 || unit.reference_id !== giftProduct.sku ||
    unit.invoice_id !== row.invoiceId || !matchesPrice(unit.amount)) {
    throw new GiftError(502, 'PayPal order details did not match this card.');
  }
  return unit;
}

export function checkCapture(order, row) {
  const unit = checkOrder(order, row);
  const matchesPrice = amount => amount?.currency_code === row.currency && amount?.value === row.price;
  const captures = unit.payments?.captures || [];
  if (captures.length === 1 && captures[0].status === 'PENDING' && matchesPrice(captures[0].amount)) return {status: 'pending'};
  if (captures.some(capture => ['DECLINED', 'DENIED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(capture.status)) ||
      order.status === 'VOIDED') return {status: 'failed'};
  if (order.status === 'CREATED' || order.status === 'PAYER_ACTION_REQUIRED') return {status: 'awaiting-approval'};
  const capture = captures[0];
  if (order.status !== 'COMPLETED' || captures.length !== 1 || capture?.status !== 'COMPLETED' ||
      capture.final_capture !== true || !capture.id || !matchesPrice(capture.amount)) {
    throw new GiftError(502, 'PayPal has not confirmed a matching final capture.');
  }
  return {status: 'paid', captureId: capture.id};
}
