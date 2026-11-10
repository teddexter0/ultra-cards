// Invoked only after the visitor explicitly chooses approximate location.
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const lat=Number(req.body?.lat),lon=Number(req.body?.lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:'Invalid coordinates.'});
  const latitude=Math.round(lat*10)/10,longitude=Math.round(lon*10)/10;
  try{const params=new URLSearchParams({lat:String(latitude),lon:String(longitude),format:'jsonv2',zoom:'3'});const r=await fetch('https://nominatim.openstreetmap.org/reverse?'+params,{headers:{'User-Agent':'UltraCards/2.0 (https://ultra-cards.vercel.app)','Accept-Language':'en'},signal:AbortSignal.timeout(9000)});if(!r.ok)throw Error();const data=await r.json();const country=data.address?.country_code?.toUpperCase();if(!country)throw Error();res.setHeader('Cache-Control','no-store');return res.status(200).json({country,source:'© OpenStreetMap contributors / Nominatim'});}catch{return res.status(503).json({error:'Location lookup is unavailable. Please choose your country manually.'});}
}
