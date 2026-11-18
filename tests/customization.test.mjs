import assert from 'node:assert/strict';
import test from 'node:test';
import {designOptions,highlightText} from '../src/design.js';
import {decodeCard,encodeCard,escapeHTML,publicCard} from '../src/engine.js';
import {cardLinkHandlers} from '../api/card-link.js';

test('each control has 50 unique presets and custom cards survive legacy encoding',()=>{
  for(const options of Object.values(designOptions)){
    assert.equal(options.length,50);
    assert.equal(new Set(options.map(({name,...effect})=>JSON.stringify(effect))).size,50);
  }
  const input = {message:'A smile for Budapest',mediaHidden:true,design:{
    movement:49,backdrop:17,lighting:12,type:11,size:27,envelopeShape:44,
    envelopeColor:49,seal:0,emphasis:41,emphasisColor:15,highlights:[' Budapest ','smile','SMILE','ignored'],
    unsupported:'unknown',
  }};
  const output = decodeCard(encodeCard(input));
  assert.deepEqual(output.design,{movement:49,backdrop:17,lighting:12,type:11,size:27,
    envelopeShape:44,envelopeColor:49,seal:0,emphasis:41,emphasisColor:15,highlights:['Budapest','smile']});
  assert.equal(output.mediaHidden,true);
  assert.deepEqual(publicCard({design:{movement:50,emphasisColor:'9'}}).design,{});
});

test('highlights match whole phrases once across headline and note, while escaping HTML',()=>{
  const seen = new Set();
  const terms = ['more you','Budapest','<b>'];
  assert.equal(highlightText('Another year.\nMore you.',terms,seen,escapeHTML),'Another year.<br><mark>More you</mark>.');
  assert.equal(highlightText('Budapester Budapest <b> more you Budapest',terms,seen,escapeHTML),
    'Budapester <mark>Budapest</mark> <mark>&lt;b&gt;</mark> more you Budapest');
});

function memoryStore(){
  const rows = new Map();
  const row = value => ({exists:value!==undefined,get:key=>value?.[key]});
  const collection = path => ({doc:key=>{
    const id = path+'/'+key;
    return {id,collection:name=>collection(id+'/'+name),get:async()=>row(rows.get(id)),
      create:async value=>{assert.ok(!rows.has(id));rows.set(id,value);}};
  }});
  const db = {collection,runTransaction:async fn=>fn({
    getAll:async (...refs)=>refs.map(ref=>row(rows.get(ref.id))),
    set:(ref,value)=>rows.set(ref.id,value),
  })};
  return {db};
}

function dispatch(handler,method,url,body){
  const req = {method,url,body,headers:{'content-type':'application/json'}};
  let status, payload;
  const res = {setHeader(){},status(code){status=code;return this;},json(value){payload=value;}};
  return handler(req,res).then(()=>({status,payload}));
}

test('guest short links store the public card with a resized photo and reject invalid files',async()=>{
  const store = memoryStore();
  const run = (...args)=>dispatch(cardLinkHandlers(async()=>store),...args);
  const card = {v:1,to:'Aly',title:'Another year',message:'Budapest',privateBrief:'private',
    design:{movement:15,highlights:['Budapest']}};
  assert.equal((await run('POST','/api/card-link',{card,photo:'data:image/jpeg;base64,AA=='})).status,400);
  assert.equal((await run('POST','/api/card-link',{card,photo:'data:image/png;base64,AA=='})).status,400);
  const photo = 'data:image/jpeg;base64,/9j/wAALCAAQABADAREA/9k=';
  const published = await run('POST','/api/card-link',{card,photo});
  assert.equal(published.status,200);
  assert.match(published.payload.id,/^[A-Za-z0-9_-]{12}$/);
  const received = await run('GET','/api/card-link?id='+published.payload.id);
  assert.equal(received.status,200);
  assert.deepEqual(received.payload,{card:publicCard(card),photo});
  assert.equal((await run('GET','/api/card-link?id=abcdefghijkl')).status,404);
});
