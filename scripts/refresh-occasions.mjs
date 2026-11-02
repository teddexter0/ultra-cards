import {mkdir,writeFile,readFile} from 'node:fs/promises';
import Holidays from 'date-holidays';
import {annualEvents} from '../src/calendar.js';
import {countries} from '../src/countries.js';
import {holidayData} from '../api/occasions.js';
import {fetchObservances,observancesForYear} from './observances.mjs';
const now=new Date(),start=new Date(now.getTime()-86400000).toISOString().slice(0,10),end=new Date(now.getTime()+31*86400000).toISOString().slice(0,10),year=now.getUTCFullYear();
const result={generatedAt:now.toISOString(),validFrom:start,validUntil:end,source:'date-holidays 3.38.0 · https://github.com/commenthol/date-holidays · CC BY 3.0 · holiday data adapted to a four-week look-ahead',countries:{},international:[year,year+1].flatMap(y=>annualEvents(y,'GLOBAL').filter(e=>e.date>=start&&e.date<=end))};
try{const rows=await fetchObservances();result.international.push(...[year,year+1].flatMap(y=>observancesForYear(rows,y)).filter(e=>e.date>=start&&e.date<=end));console.log(`Loaded ${rows.length} international observances from the UN calendar.`);}catch(error){console.log(error.message);}
for(const {code,name}of countries){const data=holidayData(code,year),next=holidayData(code,year+1);result.countries[code]={name,coverage:data.coverage,states:data.states,events:[...data.events,...next.events].filter(e=>e.date>=start&&e.date<=end)};}
await mkdir(new URL('../public/',import.meta.url),{recursive:true});await writeFile(new URL('../public/occasion-cache.json',import.meta.url),JSON.stringify(result));
console.log(`Refreshed public occasions for ${countries.length} selectable locations; ${Object.values(result.countries).filter(c=>c.coverage).length} with holiday data. No personal dates are scanned.`);
if(process.env.PUBLISH_OCCASIONS==='true'){
  const token=process.env.GITHUB_TOKEN,repo=process.env.GITHUB_REPOSITORY;if(!token||!repo)throw Error('Repository-scoped publishing credentials missing.');
  const endpoint=`https://api.github.com/repos/${repo}/contents/public/occasion-cache.json`,headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const prior=await fetch(endpoint,{headers});if(!prior.ok&&prior.status!==404)throw Error('Could not read prior public cache.');const previous=prior.ok?await prior.json():{};
  const content=await readFile(new URL('../public/occasion-cache.json',import.meta.url));const update=await fetch(endpoint,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'Refresh public occasion look-ahead',content:content.toString('base64'),...(previous.sha?{sha:previous.sha}:{}),branch:'main'})});if(!update.ok)throw Error('Could not publish the refreshed public cache.');console.log('Published the refreshed public cache.');
}
