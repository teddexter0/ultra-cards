import {publicCard} from './engine.js';

export const MAX_PHOTO_LENGTH = 450_000;
export const SHORT_ID = /^[A-Za-z0-9_-]{12}$/;

export async function preparePhoto(file) {
  if (file.size > 10_000_000) throw Error('Choose a photo smaller than 10 MB.');
  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
  const header = String.fromCharCode(...bytes);
  const png = header.startsWith('\x89PNG\r\n\x1a\n');
  const webp = header.startsWith('RIFF') && header.slice(8)==='WEBP';
  const jpeg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  if (!(png || webp || jpeg)) throw Error('Choose a JPEG, PNG or WebP photo.');
  const bitmap = await createImageBitmap(file).catch(()=>{throw Error('This photo could not be decoded.');});
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d',{alpha:false});
    for (const edge of [1200,900,640]) {
      const scale = Math.min(1,edge/Math.max(bitmap.width,bitmap.height));
      canvas.width = Math.max(1,Math.round(bitmap.width*scale));
      canvas.height = Math.max(1,Math.round(bitmap.height*scale));
      context.fillStyle = '#fff';
      context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const photo = canvas.toDataURL('image/jpeg',.78);
      if (photo.startsWith('data:image/jpeg;base64,') && photo.length<=MAX_PHOTO_LENGTH) return photo;
    }
    throw Error('This photo could not be resized. Try a smaller file.');
  } finally {
    bitmap.close();
  }
}

async function request(url, options) {
  const response = await fetch(url,{...options,signal:AbortSignal.timeout(20_000)});
  const result = await response.json().catch(()=>null);
  if (!response.ok || !result) throw Error(result?.error || 'Short links are temporarily unavailable.');
  return result;
}

let lastShare;
export async function createShortLink(card) {
  const body = JSON.stringify({card:publicCard(card),photo:card.mediaHidden?'':card.localPhoto||''});
  if (lastShare?.body===body) return lastShare.url;
  const {id} = await request('/api/card-link',{
    method:'POST',headers:{'Content-Type':'application/json'},body,
  });
  if (!SHORT_ID.test(id)) throw Error('The short link could not be created.');
  const url = new URL('/c/'+id,location.origin).href;
  lastShare = {body,url};
  return url;
}

export async function loadShortCard(id) {
  if (!SHORT_ID.test(id)) throw Error('This card link is invalid.');
  const {card,photo} = await request('/api/card-link?id='+encodeURIComponent(id));
  return {...publicCard(card),localPhoto:photo||''};
}
