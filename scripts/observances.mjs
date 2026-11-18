// Public date facts from the UN's published calendar; no personal data is fetched.
export const observanceSource='https://indonesia.un.org/en/291543-list-international-days-and-weeks';
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,h,d)=>String.fromCodePoint(parseInt(h||d,h?16:10))).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&(?:rsquo|apos);/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
export function parseObservances(html){
  const rows=[];
  for(const [,paragraph] of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)){
    for(const line of paragraph.split(/<br\s*\/?\s*>/gi)){
      const text=clean(line),m=/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\|\s*(.+)$/.exec(text);
      if(!m)continue;
      const name=m[3].replace(/\s*\[[^\]]*\]/g,'').replace(/\s*\((?:A\s*\/|WHA|UNESCO|\d+\s*C\/|Resolution|STCW)[\s\S]*$/i,'').trim();
      if(name.length>3)rows.push({month:months.indexOf(m[2])+1,day:+m[1],name});
    }
  }
  return rows.filter((r,i,a)=>a.findIndex(x=>x.name===r.name&&x.month===r.month&&x.day===r.day)===i);
}
export function observancesForYear(rows,year){
  const moving=/Vesak|Migratory Bird|Day of Cooperatives|World Habitat Day|World Maritime Day|Girls in ICT|World Philosophy Day|Road Traffic Victims|Violence and Bullying at School/i;
  const dates=rows.filter(r=>!moving.test(r.name)).map(r=>({...r,date:`${year}-${String(r.month).padStart(2,'0')}-${String(r.day).padStart(2,'0')}`}));
  function nth(month,weekday,n,name){const d=new Date(Date.UTC(year,month-1,1));d.setUTCDate(1+(weekday-d.getUTCDay()+7)%7+7*(n-1));dates.push({name,date:d.toISOString().slice(0,10)});}
  nth(4,4,4,'International Girls in ICT Day');nth(5,6,2,'World Migratory Bird Day');nth(10,6,2,'World Migratory Bird Day');nth(7,6,1,'International Day of Cooperatives');nth(10,1,1,'World Habitat Day');nth(11,4,1,'International Day against Violence and Bullying at School, including Cyberbullying');nth(11,4,3,'World Philosophy Day');nth(11,0,3,'World Day of Remembrance for Road Traffic Victims');
  const maritime=new Date(Date.UTC(year,9,0));maritime.setUTCDate(maritime.getUTCDate()-(maritime.getUTCDay()-4+7)%7);dates.push({name:'World Maritime Day',date:maritime.toISOString().slice(0,10)});
  return dates.map(r=>({id:`un:${r.date}:${r.name}`,date:r.date,name:r.name,occasion:r.name,kind:/week/i.test(r.name)?'International week':'International observance',source:'United Nations public observance calendar',url:observanceSource}));
}
export async function fetchObservances(){
  const response=await fetch(observanceSource,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('UN observance source unavailable');
  const rows=parseObservances(await response.text());
  if(rows.length<100)throw Error('UN calendar format changed; retaining the curated fallback');
  return rows;
}
