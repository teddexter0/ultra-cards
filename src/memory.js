export const preferenceFields=['to','nickname','relationship','pronouns','details','flowers','scenery','favouriteColor','sharedMemory','admiration','interests','avoid','futureWish','tone'];
export function recipientProfile(card){return Object.fromEntries(preferenceFields.map(k=>[k,String(card[k]||'').slice(0,k==='details'?1200:500)]));}
export function applyProfile(card,profile){return {...card,...recipientProfile(profile),id:card.id,occasion:card.occasion,from:card.from};}
export function profileKey(name){return String(name||'').trim().normalize('NFKC').toLocaleLowerCase();}
export function upsertProfile(profiles,card){const p=recipientProfile(card);if(!profileKey(p.to))return profiles;return [{...p,updatedAt:new Date().toISOString()},...profiles.filter(x=>profileKey(x.to)!==profileKey(p.to))].slice(0,200);}
export function briefRows(c){return [['For',c.to],['Relationship',c.relationship],['Nickname',c.nickname],['What stands out',c.admiration||c.details],['Your memory',c.sharedMemory],['Their interests',c.interests],['Flowers / things',c.flowers],['Scenery',c.scenery],['Favourite colour',c.favouriteColor],['Hope for them',c.futureWish],['Avoid',c.avoid]].filter(([,v])=>v);}
