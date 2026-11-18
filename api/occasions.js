import Holidays from 'date-holidays';
import {countries} from '../src/countries.js';
export function holidayData(country,year,region=''){
  if(!countries.some(c=>c.code===country))throw Error('Choose a valid country or territory.');
  const hd=new Holidays(),supported=hd.getCountries('en');
  if(!supported[country])return {country,coverage:false,events:[],states:{},source:'date-holidays',note:'This location is selectable, but the dataset does not contain national holidays for it. International observances remain available.'};
  const states=hd.getStates(country,'en')||{};if(region&&!states[region])throw Error('Choose a valid region.');
  hd.init(country,region||undefined,undefined,{languages:['en']});
  return {country,region,year,coverage:true,states,source:'date-holidays 3.38.0 · commenthol and contributors · CC BY 3.0',events:hd.getHolidays(year).map(e=>({id:[country,region,e.date,e.name].join(':'),date:e.date.slice(0,10),name:e.name,occasion:e.name,kind:e.type==='public'?'Public holiday':e.type==='bank'?'Bank holiday':e.type==='school'?'School holiday':e.type==='optional'?'Optional observance':'Country observance',source:'date-holidays · verify official local announcements',note:e.note||'',url:'https://github.com/commenthol/date-holidays'}))};
}
export default function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const country=String(req.query.country||'KE').toUpperCase(),year=Number(req.query.year||new Date().getUTCFullYear()),region=String(req.query.region||'').slice(0,12);
  if(!Number.isInteger(year)||year<2000||year>2100)return res.status(400).json({error:'Year must be between 2000 and 2100.'});
  try{const data=holidayData(country,year,region);res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=86400');return res.status(200).json(data);}catch(e){return res.status(400).json({error:e.message});}
}
