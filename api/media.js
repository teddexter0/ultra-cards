// Server-side credentials only. Deploy with PEXELS_API_KEY and/or PIXABAY_API_KEY.
export default async function handler(req,res){
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=3600');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const query=String(req.query.q||'').trim().slice(0,90),type=req.query.type==='video'?'video':'image';
  if(query.length<2)return res.status(400).json({error:'Enter at least two characters.'});
  const provider=req.query.provider==='pixabay'?'pixabay':'pexels';
  const key=provider==='pexels'?process.env.PEXELS_API_KEY:process.env.PIXABAY_API_KEY;
  if(!key)return res.status(503).json({error:`${provider==='pexels'?'Pexels':'Pixabay'} search is not connected yet. Use the free search link below, or paste a direct HTTPS media URL.`});
  try{
    let url,headers={};if(provider==='pexels'){url=type==='video'?'https://api.pexels.com/videos/search':'https://api.pexels.com/v1/search';url+='?'+new URLSearchParams({query,per_page:'12',orientation:'landscape'});headers.Authorization=key;}
    else url='https://pixabay.com/api/'+(type==='video'?'videos/':'')+'?'+new URLSearchParams({key,q:query,per_page:'12',safesearch:'true'});
    const r=await fetch(url,{headers,signal:AbortSignal.timeout(10000)});if(!r.ok)return res.status(r.status===429?429:502).json({error:r.status===429?'Media search limit reached. Try again later.':'The media provider is unavailable.'});const data=await r.json();
    const results=provider==='pexels'?(data.photos||data.videos||[]).map(p=>({id:p.id,type,url:type==='video'?p.video_files.filter(f=>f.file_type==='video/mp4'&&f.width<=1920).sort((a,b)=>b.width-a.width)[0]?.link:p.src.large2x,thumbnail:type==='video'?p.image:p.src.medium,credit:type==='video'?p.user.name:p.photographer,creditUrl:type==='video'?p.user.url:p.photographer_url,sourceUrl:p.url,provider:'Pexels'})):(data.hits||[]).map(p=>({id:p.id,type,url:type==='video'?(p.videos.medium?.url||p.videos.small?.url):p.largeImageURL,thumbnail:type==='video'?(p.videos.tiny?.thumbnail||p.videos.small?.thumbnail):p.previewURL,credit:p.user,creditUrl:p.pageURL,sourceUrl:p.pageURL,provider:'Pixabay'}));
    return res.status(200).json({results:results.filter(p=>p.url)});
  }catch{return res.status(502).json({error:'Media search timed out. Please try again.'});}
}
