export class GiftError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function services() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new GiftError(503, 'Gift services are awaiting server configuration.');
  const [{cert, getApps, initializeApp}, {getAuth}, {getFirestore}] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/auth'), import('firebase-admin/firestore'),
  ]);
  const app = getApps()[0] ?? initializeApp({credential: cert(JSON.parse(raw))});
  return {db: getFirestore(app), auth: getAuth(app)};
}

export function route(handler, method = 'POST') {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (req.method !== method) {
        res.setHeader('Allow', method);
        throw new GiftError(405, 'Method not allowed.');
      }
      let body = req.body;
      if (method === 'POST') {
        if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
          throw new GiftError(415, 'Send JSON to this endpoint.');
        }
        if (Number(req.headers['content-length']) > 20000) throw new GiftError(413, 'Request too large.');
        try {
          if (typeof body === 'string') body = JSON.parse(body);
        } catch {
          throw new GiftError(400, 'Invalid JSON.');
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new GiftError(400, 'Invalid request.');
        if (Buffer.byteLength(JSON.stringify(body)) > 20000) throw new GiftError(413, 'Request too large.');
      }
      res.status(200).json(await handler(req, body));
    } catch (error) {
      if (!(error instanceof GiftError)) console.error('Gift endpoint failed', error.code || error.name);
      res.status(error instanceof GiftError ? error.status : 500)
        .json({error: error instanceof GiftError ? error.message : 'Gift services are temporarily unavailable.'});
    }
  };
}

export async function signedIn(req) {
  const token = /^Bearer (\S+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) throw new GiftError(401, 'Sign in to continue.');
  const {db, auth} = await services();
  try {
    const {uid} = await auth.verifyIdToken(token, true);
    return {uid, db};
  } catch {
    throw new GiftError(401, 'Your session expired. Sign in again to continue.');
  }
}

export async function rateLimit(db, uid, scope, userLimit, totalLimit) {
  const windowMs = 15 * 60 * 1000;
  const window = Math.floor(Date.now() / windowMs);
  const global = db.collection('giftRateLimits').doc(scope);
  const user = global.collection('users').doc(uid);
  await db.runTransaction(async tx => {
    const rows = await tx.getAll(global, user);
    const counts = rows.map(row => row.get('window') === window ? row.get('count') : 0);
    if (counts[0] >= totalLimit || counts[1] >= userLimit) {
      throw new GiftError(429, 'The service reached its request limit. Try again in a few minutes.');
    }
    tx.set(global, {window, count: counts[0] + 1});
    tx.set(user, {window, count: counts[1] + 1});
  });
}
