export const isoLocal=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function dateFromISO(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');if(!m)return null;const d=new Date(+m[1],+m[2]-1,+m[3],12);return isoLocal(d)===s?d:null;}
export function horizon(events,now=new Date(),days=28){const start=isoLocal(now);const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+days);return events.filter(e=>dateFromISO(e.date)&&e.date>=start&&e.date<=isoLocal(end)).sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));}
function nthSunday(year,month,n){const d=new Date(year,month,1,12);d.setDate(1+(7-d.getDay())%7+7*(n-1));return isoLocal(d);}
export function easter(year){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;return new Date(year,Math.floor(n/31)-1,n%31+1,12);}
export function annualEvents(year,country='KE'){
  const make=(md,name,kind='Observance',occasion=name)=>({id:`${year}-${md}-${name}`,date:`${year}-${md}`,name,kind,occasion,source:'Curated annual calendar'});
  const days=[['01-01','New Year','New Year'],['02-04','World Cancer Day'],['02-14','Valentine’s Day'],['03-08','International Women’s Day'],['03-17','St. Patrick’s Day'],['03-20','International Day of Happiness'],['04-22','Earth Day'],['05-01','Labour Day'],['06-05','World Environment Day'],['07-30','International Day of Friendship'],['08-12','International Youth Day'],['09-21','International Day of Peace'],['10-05','World Teachers’ Day'],['10-10','World Mental Health Day'],['10-31','Halloween'],['11-13','World Kindness Day'],['11-19','International Men’s Day'],['11-20','World Children’s Day'],['12-01','World AIDS Day'],['12-03','International Day of Persons with Disabilities'],['12-10','Human Rights Day'],['12-25','Christmas']].map(([md,n,o])=>make(md,n,'Observance',o||n));
  days.push({id:`${year}-mothers`,date:nthSunday(year,4,2),name:'Mother’s Day',occasion:'Mother’s Day',kind:'Cultural date',source:'Second Sunday in May convention; dates differ by country'}, {id:`${year}-fathers`,date:nthSunday(year,5,3),name:'Father’s Day',occasion:'Father’s Day',kind:'Cultural date',source:'Third Sunday in June convention; dates differ by country'});
  const programmer=new Date(year,0,256,12);days.push({...make(isoLocal(programmer).slice(5),'Programmer’s Day'),source:'256th day of the year'});
  const appreciation=new Date(year,2,1,12);appreciation.setDate(1+(5-appreciation.getDay()+7)%7);days.push({...make(isoLocal(appreciation).slice(5),'Employee Appreciation Day'),source:'First Friday in March convention'});
  if(country==='KE'){
    [['01-01','New Year’s Day'],['05-01','Labour Day'],['06-01','Madaraka Day'],['10-10','Mazingira Day'],['10-20','Mashujaa Day'],['12-12','Jamhuri Day'],['12-25','Christmas'],['12-26','Boxing Day']].forEach(([md,name])=>days.push({...make(md,name,'Public holiday'),source:'Kenya baseline; verify Gazette for changes and additional holidays'}));
    const goodFriday=easter(year);goodFriday.setDate(goodFriday.getDate()-2);const monday=easter(year);monday.setDate(monday.getDate()+1);
    for(const [d,name]of [[goodFriday,'Good Friday'],[monday,'Easter Monday']])days.push({...make(isoLocal(d).slice(5),name,'Public holiday','Easter'),source:'Gregorian Easter calculation'});
    // Sunday public holidays receive the following non-holiday working day.
    for(const e of [...days.filter(e=>e.kind==='Public holiday')]){const d=dateFromISO(e.date);if(d.getDay()===0){do{d.setDate(d.getDate()+1);}while(d.getDay()===0||days.some(x=>x.kind==='Public holiday'&&x.date===isoLocal(d)));days.push({...e,id:e.id+'-observed',date:isoLocal(d),name:e.name+' (observed)'});}}
  }
  return days.filter((e,i,a)=>a.findIndex(x=>x.date===e.date&&x.name===e.name)===i);
}
export async function countryHolidays(country,years){
  const results=await Promise.all(years.map(async y=>{const r=await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/${country}`,{signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error('Public holiday feed unavailable for this country.');const data=await r.json();return data.map(e=>({id:`${country}-${e.date}-${e.name}`,date:e.date,name:e.localName||e.name,occasion:e.name,kind:e.global?'Public holiday':'Regional holiday',regions:e.counties||[],source:'Nager.Date · confirm local announcements',url:'https://date.nager.at'}));}));return results.flat();
}
export function personalOccurrences(entries,year){return entries.flatMap(e=>{if(!dateFromISO(e.date))return [];if(!e.repeat)return [{...e,kind:'Personal date',source:'Added by you'}];const date=`${year}-${e.date.slice(5)}`;return dateFromISO(date)?[{...e,date,kind:'Personal date',source:'Added by you'}]:[];});}
export function parseICS(text,year=new Date().getFullYear()){
  if(text.length>2_000_000)throw Error('Please import a calendar smaller than 2 MB.');
  const blocks=text.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1);let skipped=0;
  const events=[];for(const block of blocks){const fields={};for(const line of block.split(/\r?\n/)){const at=line.indexOf(':');if(at<0)continue;fields[line.slice(0,at).split(';')[0]]=line.slice(at+1);}
    if(fields.STATUS==='CANCELLED'||!fields.DTSTART||!fields.SUMMARY)continue;
    if(fields.RRULE&&!/^FREQ=YEARLY(?:;|$)/.test(fields.RRULE)){skipped++;continue;}
    if(fields.RRULE&&/BY|INTERVAL|UNTIL|COUNT/.test(fields.RRULE)){skipped++;continue;}
    if(fields.RECURRENCE_ID||fields['RECURRENCE-ID']){skipped++;continue;}
    const match=/^(\d{4})(\d{2})(\d{2})/.exec(fields.DTSTART);if(!match){skipped++;continue;}
    const date=`${fields.RRULE?year:match[1]}-${match[2]}-${match[3]}`;if(!dateFromISO(date))continue;
    events.push({id:fields.UID||crypto.randomUUID(),name:fields.SUMMARY.replace(/\\n/g,' ').replace(/\\([,;\\])/g,'$1').slice(0,150),date,occasion:/birthday/i.test(fields.SUMMARY)?'Birthday':'Just because',repeat:!!fields.RRULE,kind:'Imported calendar',source:'Imported .ics; local date from event'});
  }return {events,skipped};
}
