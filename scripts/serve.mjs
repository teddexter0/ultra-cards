import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png'};
const endpoints=new Set(['gift-ai','gift-checkout','gift-share','media','location','occasions']);
async function api(name,url,req,res){
  req.query=Object.fromEntries(url.searchParams);
  if(req.method==='POST'){
    let size=0;
    const chunks=[];
    for await(const chunk of req.iterator({destroyOnReturn:false})){
      size+=chunk.length;
      if(size>20000){
        res.writeHead(413,{'Content-Type':'application/json',Connection:'close'});
        res.end(JSON.stringify({error:'Request too large.'}));
        return;
      }
      chunks.push(chunk);
    }
    req.body=Buffer.concat(chunks).toString('utf8');
  }
  res.status=status=>{res.statusCode=status;return res;};
  res.json=body=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
  const {default:handler}=await import('../api/'+name+'.js');
  await handler(req,res);
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(root+path.sep)&&file!==root)throw new Error('Invalid path');
    if(endpoints.has(url.pathname.slice(5))&&url.pathname.startsWith('/api/'))return await api(url.pathname.slice(5),url,req,res);
    if(!/^(?:\/(?:favicon\.svg|firebase-sdk\.js|firebase-config\.json|brand-ribbon\.svg|occasion-cache\.json)?|\/src\/[a-z0-9-]+\.(?:js|css)|\/card(?:\/.*)?)$/.test(url.pathname))throw Error('Invalid path');
    if(url.pathname==='/firebase-sdk.js')file=path.join(root,'dist','firebase-sdk.js');
    if(['/firebase-config.json','/brand-ribbon.svg','/occasion-cache.json'].includes(url.pathname))file=path.join(root,'public',url.pathname.slice(1));
    if(url.pathname==='/'||/^\/card(?:\/|$)/.test(url.pathname))file=path.join(root,'index.html');
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Ultra Cards: http://127.0.0.1:'+server.address().port));
