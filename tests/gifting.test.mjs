import assert from 'node:assert/strict';
import {test} from 'node:test';
import {checkoutHandler} from '../api/gift-checkout.js';
import {aiBrief, generateGift} from '../server/gift-ai.js';
import {scenes, variant} from '../src/engine.js';

const cardId = 'fixture-card';
const orderId = 'TESTORDER123';
const brief = {action: 'generate', tone: 'Playful', length: 'Short', occasion: 'Birthday'};

function checkoutFixture() {
  const records = new Map();
  const calls = [];
  let order;
  const ref = path => ({
    collection: name => ref(path + '/' + name),
    doc: id => ref(path + '/' + id),
    get: async () => ({data: () => records.get(path)}),
    create: async value => {
      assert.equal(records.has(path), false);
      records.set(path, value);
    },
    path,
  });
  const db = {
    collection: name => ref(name),
    runTransaction: operation => operation({
      get: doc => doc.get(),
      set: (doc, value) => records.set(doc.path, value),
      update: (doc, value) => records.set(doc.path, {...records.get(doc.path), ...value}),
    }),
  };
  const handler = checkoutHandler({
    authenticate: async req => ({db, uid: req.headers.authorization}),
    limit: async () => {},
    config: () => ({clientId: 'sandbox-fixture'}),
    paypal: async (path, options) => {
      calls.push({path, options});
      if (!path) order = {id: orderId, status: 'CREATED', purchase_units: options.body.purchase_units};
      return order;
    },
  });
  const request = async (action, body = {}, uid = 'alice') => {
    const req = {method: 'POST', headers: {'content-type': 'application/json', authorization: uid}, body: {action, cardId, ...body}};
    const res = {
      setHeader() {},
      status(code) { this.code = code; return this; },
      json(result) { this.result = result; },
    };
    await handler(req, res);
    return {code: res.code, result: res.result};
  };
  const setCapture = (status, price = '2.99') => {
    order.status = 'COMPLETED';
    order.purchase_units[0].payments = {captures: [{
      id: 'TESTCAPTURE', status, final_capture: true, amount: {currency_code: 'USD', value: price},
    }]};
  };
  return {calls, request, setCapture, records};
}

const card = {to: 'Jamie', from: 'Alex', title: 'Happy birthday', message: 'Here’s to another hike.', interests: 'Private detail'};

test('checkout sets its own price, reuses a canceled order and rejects other owners', async () => {
  const {calls, request} = checkoutFixture();
  assert.equal((await request('publish', {card})).code, 403);
  assert.equal((await request('create', {price: '0.01'})).result.orderId, orderId);
  assert.deepEqual(calls[0].options.body.purchase_units[0].amount, {currency_code: 'USD', value: '2.99'});
  assert.equal((await request('capture', {orderId})).result.status, 'awaiting-approval');
  assert.equal((await request('create')).result.orderId, orderId);
  assert.equal(calls.filter(call => !call.path).length, 1);
  assert.equal((await request('capture', {orderId}, 'bob')).code, 409);
});

test('only a matching final capture unlocks and publish excludes private details', async () => {
  const {calls, request, setCapture, records} = checkoutFixture();
  await request('create');
  setCapture('PENDING');
  assert.equal((await request('capture')).result.status, 'pending');
  assert.equal((await request('publish', {card})).code, 403);
  assert.equal((await request('create')).result.status, 'pending');
  setCapture('COMPLETED', '0.01');
  assert.equal((await request('capture')).code, 502);
  setCapture('COMPLETED');
  assert.equal((await request('capture')).result.status, 'paid');
  const callCount = calls.length;
  assert.equal((await request('capture')).result.status, 'paid');
  assert.equal(calls.length, callCount);
  assert.equal((await request('publish', {card}, 'bob')).code, 403);
  const {shareId} = (await request('publish', {card})).result;
  assert.match(shareId, /^[a-zA-Z0-9_-]{32}$/);
  assert.equal(records.get('giftShares/' + shareId).card.to, 'Jamie');
  assert.equal(records.get('giftShares/' + shareId).card.interests, undefined);
});

test('declined captures stay locked and a failed order can be replaced', async () => {
  const {calls, request, setCapture} = checkoutFixture();
  await request('create');
  setCapture('DECLINED');
  assert.equal((await request('capture')).result.status, 'failed');
  assert.equal((await request('publish', {card})).code, 403);
  await request('create');
  assert.notEqual(calls[0].options.requestId, calls.at(-1).options.requestId);
});

test('Gemini requires consent and its response is filtered against the actual design catalogue', async t => {
  assert.throws(() => aiBrief(brief), {status: 400});
  assert.throws(() => aiBrief({...brief, consent: true, memory: 'x'.repeat(701)}), {status: 400});
  const input = aiBrief({...brief, consent: true});
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'fixture-key';
  t.after(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });
  const [scene] = scenes;
  const result = await generateGift(input, async (_url, request) => {
    assert.equal(request.headers['x-goog-api-key'], 'fixture-key');
    const {catalogue} = JSON.parse(JSON.parse(request.body).contents[0].parts[0].text);
    assert.ok(catalogue.some(item => item.id === scene.id));
    const text = JSON.stringify({title: 'A birthday', message: 'See you on the trail.',
      recommendations: [{id: 'invented', reason: 'No'}, {id: scene.id, reason: 'Fits Jamie.'}]});
    return Response.json({candidates: [{content: {parts: [{text}]}}]});
  });
  assert.equal(result.message, 'See you on the trail.');
  assert.deepEqual(result.recommendations, [{variant: 0, reason: 'Fits Jamie.'}]);
  assert.match(variant(0).name, new RegExp(scene.name));
  await assert.rejects(generateGift(input, async () => Response.json({}, {status: 429})), {status: 429});
});
