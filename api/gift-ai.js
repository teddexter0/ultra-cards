import {aiBrief, generateGift} from '../server/gift-ai.js';
import {rateLimit, route, signedIn} from '../server/gift-runtime.js';

export default route(async (req, body) => {
  const brief = aiBrief(body);
  const {db, uid} = await signedIn(req);
  await rateLimit(db, uid, 'ai', 12, 100);
  return generateGift(brief);
});
