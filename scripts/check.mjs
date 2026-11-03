import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const base=path.resolve(import.meta.dirname,'..');
for(const folder of ['src','api','scripts'])for(const item of await readdir(path.join(base,folder)))if(/\.(js|mjs)$/.test(item))execFileSync(process.execPath,['--check',path.join(base,folder,item)],{stdio:'inherit'});
console.log('All client, endpoint and build scripts pass syntax checks.');
