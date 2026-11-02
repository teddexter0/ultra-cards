import {cp,mkdir,rm} from 'node:fs/promises';
const out=new URL('../dist/',import.meta.url);
try{await import('./refresh-occasions.mjs');}catch(error){if(error.code==='ERR_MODULE_NOT_FOUND')console.log('Holiday engine not installed locally; live holiday feed remains available after deployment.');else throw error;}
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['index.html','favicon.svg','src','public']){
  try{await cp(new URL('../'+name,import.meta.url),new URL(name==='public'?'.':name,out),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
}
console.log('Built static studio into dist. No dependencies required.');
