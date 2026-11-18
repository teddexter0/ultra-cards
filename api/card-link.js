import {createHash, randomBytes} from 'node:crypto';
import {GiftError, rateLimit, route, services} from '../server/gift-runtime.js';
import {publicCard} from '../src/engine.js';
import {MAX_PHOTO_LENGTH, SHORT_ID} from '../src/sharing.js';

function checkedPhoto(photo) {
  if (typeof photo !== 'string' || photo.length > MAX_PHOTO_LENGTH ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo)) {
    throw new GiftError(400,'Use a photo resized in the card editor.');
  }
  const encoded = photo.slice('data:image/jpeg;base64,'.length);
  const bytes = Buffer.from(encoded,'base64');
  if (bytes.length<12 || bytes.toString('base64') !== encoded || bytes.readUInt16BE(0)!==0xffd8 ||
      bytes.readUInt16BE(bytes.length-2)!==0xffd9) {
    throw new GiftError(400,'This photo could not be verified.');
  }
  for (let i=2;i+9<bytes.length && bytes[i]===0xff;) {
    const marker = bytes[i+1];
    const length = bytes.readUInt16BE(i+2);
    if (length<2 || i+2+length>bytes.length || marker===0xda) break;
    if ([0xc0,0xc1,0xc2].includes(marker) && length>=8) {
      const height = bytes.readUInt16BE(i+5), width = bytes.readUInt16BE(i+7);
      if (height>0 && height<=1200 && width>0 && width<=1200) return photo;
      break;
    }
    i+=2+length;
  }
  throw new GiftError(400,'The photo size could not be verified.');
}

export function cardLinkHandlers(getServices=services) {
  const read = route(async req=>{
    const id = new URL(req.url,'http://localhost').searchParams.get('id');
    if (!SHORT_ID.test(id||'')) throw new GiftError(404,'This card link is invalid.');
    const {db} = await getServices();
    const row = await db.collection('cardLinks').doc(id).get();
    if (!row.exists) throw new GiftError(404,'This card link could not be found.');
    return {card:row.get('card'),photo:row.get('photo')||''};
  },'GET');
  const write = route(async (req,body)=>{
    const input = body.card;
    if (!input || input.v!==1 || typeof input.title!=='string' || typeof input.message!=='string') {
      throw new GiftError(400,'Add the headline and note before sharing.');
    }
    if (Buffer.byteLength(JSON.stringify(input))>32_000) throw new GiftError(413,'Card text or media links are too large.');
    const card = publicCard(input);
    const photo = !card.mediaHidden && body.photo ? checkedPhoto(body.photo) : '';
    const {db} = await getServices();
    const address = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'local';
    const visitor = createHash('sha256').update(String(address)).digest('hex').slice(0,32);
    await rateLimit(db,visitor,'card-link',30,500);
    const id = randomBytes(9).toString('base64url');
    await db.collection('cardLinks').doc(id).create({card,photo,createdAt:new Date()});
    return {id};
  },'POST',500_000);
  return (req,res)=>req.method==='GET'?read(req,res):write(req,res);
}

export default cardLinkHandlers();
