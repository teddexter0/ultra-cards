import {extraScenes} from './catalogue.js';
// Original compositions. Old scene indices remain stable so previously sent links still work.
export const scenes = [
  {id:'botanical',name:'The Sunroom',tag:'Botanical · softly unfolding',title:'You make life\na little brighter.',color:'#e8e8b9',ink:'#34492e',accent:'#467369',motif:'❀',photo:'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=1100',credit:'Secret Garden / Pexels',url:'https://www.pexels.com/photo/assorted-color-flowers-931177/',layout:'arch'},
  {id:'coast',name:'Golden Hour',tag:'Cinematic · a slow exhale',title:'A little sunshine,\njust for you.',color:'#ead3bb',ink:'#503626',accent:'#a54a27',motif:'☼',photo:'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1100',credit:'Asad Photo Maldives / Pexels',url:'https://www.pexels.com/photo/island-during-golden-hour-and-blue-sky-457882/',layout:'horizon'},
  {id:'nocturne',name:'After Midnight',tag:'Celestial · written in the stars',title:'Some people\nare their own kind\nof magic.',color:'#212a42',ink:'#f0e8ca',accent:'#e1bb73',motif:'✦',layout:'orbit'},
  {id:'alpine',name:'Higher Places',tag:'Alpine · room to dream',title:'Here’s to\nyour next\ngreat adventure.',color:'#d9e3da',ink:'#29423b',accent:'#a85537',motif:'△',photo:'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1100',credit:'Pixabay / Pexels',url:'https://www.pexels.com/photo/green-grass-field-and-mountain-417074/',layout:'window'},
  {id:'confetti',name:'Good Chaos',tag:'Playful · unapologetically happy',title:'The world’s\nbetter with\nyou in it.',color:'#f1b957',ink:'#482d2c',accent:'#6b48ac',motif:'♪',layout:'burst'},
  {id:'herbarium',name:'Wild & Wonderful',tag:'Organic · a little untamed',title:'Keep growing\nin your own\nbeautiful way.',color:'#d6dfc7',ink:'#304936',accent:'#ab563b',motif:'❧',photo:'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1100',credit:'Scott Webb / Pexels',url:'https://www.pexels.com/photo/green-leafed-plant-807598/',layout:'oval'},
  {id:'loveletter',name:'Postscript',tag:'Intimate · from me to you',title:'Of all the little\nthings, you’re\nmy favourite.',color:'#eac9c0',ink:'#68372f',accent:'#a13932',motif:'♡',layout:'letter'},
  {id:'noir',name:'In Good Taste',tag:'Editorial · quietly extraordinary',title:'Simply,\nextraordinarily,\nyou.',color:'#242420',ink:'#eee9da',accent:'#ceaf78',motif:'◒',layout:'type'},
  {id:'prism',name:'Another Dimension',tag:'Iridescent · a different perspective',title:'You’re made\nof remarkable\nthings.',color:'#ddd6ed',ink:'#423650',accent:'#8654a0',motif:'◇',layout:'prism'},
  {id:'aurora',name:'Northern Lights',tag:'Atmospheric · a beautiful surprise',title:'May beautiful\nthings find\ntheir way to you.',color:'#193b3c',ink:'#e0eadc',accent:'#b6d596',motif:'✧',layout:'aurora'},
  {id:'postcard',name:'Wish You Were Here',tag:'Nostalgic · a small keepsake',title:'Good days.\nGreat stories.\nMore of both.',color:'#e9debd',ink:'#51472f',accent:'#a74a2b',motif:'✉',layout:'postage'},
  {id:'arcade',name:'Level Up',tag:'Retro-future · a new high score',title:'New chapter.\nSame legend.\nLet’s go.',color:'#b9d4ec',ink:'#243c58',accent:'#b1472d',motif:'⌘',layout:'grid'}
];
scenes.push(...extraScenes);
export const TOTAL_VARIANTS=scenes.length*20;
export const fonts = [
  {name:'The editorial',family:'"Cormorant Garamond", Georgia, serif'},
  {name:'The calligrapher',family:'"Allura", "Caveat", cursive'},
  {name:'The modern',family:'"Manrope", "Space Grotesk", sans-serif'},
  {name:'The classic',family:'"Playfair Display", Georgia, serif'}
];
export const palettes = ['Original','Warm paper','Sage study','Blue hour','Rosewood'];
const alternate=[null,['#eee3ce','#513d2a','#a8462e'],['#d8dfca','#2d4538','#8c4c32'],['#26374a','#f1e6d1','#d9b77d'],['#ead0ca','#623b3c','#9e393d']];
export const occasions=['Birthday','Christmas','Graduation','Valentine’s Day','Mother’s Day','Father’s Day','Congratulations','Good luck','Anniversary','Thank you','Thinking of you','Get well soon','New Year','Easter','Eid','Diwali','Halloween','St. Patrick’s Day','Labour Day','Employee Appreciation Day','Programmer’s Day','World AIDS Day','World Cancer Day','Jamhuri Day','Madaraka Day','Mashujaa Day','Mazingira Day','Just because','Custom occasion'];
export function variant(id=0){id=Number(id);id=Number.isFinite(id)?Math.trunc(id):0;id=((id%TOTAL_VARIANTS)+TOTAL_VARIANTS)%TOTAL_VARIANTS;const scene=scenes[Math.floor(id/20)];const palette=Math.floor(id/4)%5;const type=id%4;const colors=alternate[palette]||[scene.color,scene.ink,scene.accent];return {...scene,variant:id,palette,type,color:colors[0],ink:colors[1],accent:colors[2],font:fonts[type].family};}
export function freshVariant(history=[],sceneId=null,random=Math.random){const allowed=Array.from({length:TOTAL_VARIANTS},(_,i)=>i).filter(i=>!sceneId||scenes[Math.floor(i/20)].id===sceneId);if(!allowed.length)return freshVariant(history,null,random);const fresh=allowed.filter(i=>!history.includes(i));const choices=fresh.length?fresh:allowed;return choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];}
export function suggestVariant(c){const text=[c.scenery,c.flowers,c.details,c.interests].join(' ').toLowerCase();const scene=/mountain|alpine|hiking|peak/.test(text)?3:/beach|coast|ocean|sunset/.test(text)?1:/flower|rose|tulip|sunflower|garden/.test(text)?0:/space|star|moon/.test(text)?2:/game|code|program/.test(text)?11:/valentine|anniversary/.test(c.occasion?.toLowerCase())?6:/birthday|congratulation/.test(c.occasion?.toLowerCase())?4:0;const prefs=[c.favouriteColor,c.flowers].join(' ').toLowerCase();const palette=/blue|navy|indigo/.test(prefs)?3:/green|sage|olive/.test(prefs)?2:/pink|rose|blush/.test(prefs)?4:/gold|orange|warm|cream/.test(prefs)?1:0;return scene*20+palette*4;}
function baseCompose(c,version=0){
  const name=(c.to||'you').trim(), occasion=c.occasion||'Just because', note=(c.details||'').trim();
  const o=occasion.toLowerCase();let title,body;
  if(/get well|cancer|aids/.test(o)){title='A little care,\na little company.';body='Thinking of you with care. There’s no perfect thing to say, but I hope you feel supported, heard, and never alone.';}
  else if(/birthday/.test(o)){title=['Another year.\nMore you.','The world got\nlucky with you.','A whole new\nchapter awaits.'][version%3];body=`Happiest of birthdays, ${name}. Here’s to more moments that feel like you, more little adventures, and plenty of reasons to smile.`;}
  else if(/graduat|congrat|success/.test(o)){title='Look at you.\nYou did that.';body=`${name}, I hope you take a moment to enjoy what you’ve achieved. Here’s to the work behind you, the possibilities ahead, and a very well-earned celebration.`;}
  else if(/christmas/.test(o)){title='A little light.\nA little magic.';body=`Merriest of Christmases, ${name}. Wishing you a gentle end to the year, little moments of wonder, and good things finding their way to you.`;}
  else if(/mother|father/.test(o)){title='For all the ways\nyou show up.';body=`Happy ${occasion}, ${name}. Thank you for the care, the patience, and all the things you do that don’t always get said out loud. Today, I’m saying them.`;}
  else if(/valentine|anniversary/.test(o)){title='You have a way\nof making ordinary\nfeel special.';body=`${name}, I wanted to make you a little something that feels as special as the moments we share. Happy ${occasion}.`;}
  else if(/luck/.test(o)){title='You’ve got this.\nAnd I’ve got you.';body=`Rooting for you, ${name}. May your preparation meet a little luck, and may you remember just how much you bring to the table.`;}
  else if(o==='just because'||o==='thinking of you'){title=variant(c.variant).title;body=`No grand occasion needed, ${name}. Just a little reminder that you’re appreciated, and that I’m glad our paths crossed.`;}
  else {title=`A little something,\njust for you.`;body=`Wishing you a meaningful ${occasion}, ${name}. Here’s to a moment to pause, connect, and appreciate the people who make life a little richer.`;}
  if(note){
    if(/laugh|giggle/.test(note.toLowerCase()))body+='\n\n'+['Your laugh has this lovely habit of turning an ordinary moment into the warmest part of my day.','Some sounds deserve an encore. Your laugh is one of them.','If warmth had a soundtrack, I think it would sound a little like your laugh.'][version%3];
    else body+='\n\n'+note;
  }
  if(c.tone==='Playful'&&!/get well|cancer|aids/.test(o))body+='\n\nConsider this your very official reminder: you’re kind of a big deal.';
  if(c.tone==='Understated')body=body.split('\n\n')[0]+(note?'\n\n'+note:'');
  return {title,message:body};
}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function safeMedia(value,allowData=false){try{const u=new URL(value);return u.protocol==='https:'||(allowData&&/^data:image\/(jpeg|png|webp);base64,/.test(value))?value:'';}catch{return '';}}
export function publicCard(c){return {v:1,to:String(c.to||'You').slice(0,80),from:String(c.from||'Someone who cares').slice(0,80),occasion:String(c.occasion||'Just because').slice(0,100),title:String(c.title||'A little something for you.').slice(0,240),message:String(c.message||'').slice(0,6000),variant:variant(c.variant).variant,mediaUrl:safeMedia(c.mediaUrl),mediaType:c.mediaType==='video'?'video':'image',credit:String(c.credit||'').slice(0,200),creditUrl:safeMedia(c.creditUrl),color:/^#[0-9a-f]{6}$/i.test(c.color||'')?c.color:'',motion:c.motion!==false};}
export function encodeCard(c){return btoa(Array.from(new TextEncoder().encode(JSON.stringify(publicCard(c))),x=>String.fromCharCode(x)).join('')).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export function decodeCard(s){if(!s||s.length>16000)throw Error('This card link is invalid or too large.');const bytes=Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),x=>x.charCodeAt(0));const c=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(c.v!==1||typeof c.message!=='string')throw Error('This card link is not supported.');return publicCard(c);}

export function compose(c,version=0){
  const result=baseCompose({...c,to:c.nickname||c.to},version);const parts=[result.message];
  if(c.admiration?.trim())parts.push('One thing I appreciate about you: '+c.admiration.trim());
  if(c.sharedMemory?.trim())parts.push('A little memory worth keeping: '+c.sharedMemory.trim());
  if(c.futureWish?.trim())parts.push('My wish for you: '+c.futureWish.trim());
  result.message=parts.join('\n\n');
  if(c.tone==='Poetic'&&!/cancer|aids|get well/i.test(c.occasion||''))result.message+='\n\nMay the days ahead bring a little more light, a little more wonder, and room for the things that make you, you.';
  const avoid=String(c.avoid||'').split(/[,;\n]/).map(s=>s.trim().toLocaleLowerCase()).filter(s=>s.length>2);
  if(avoid.length)result.message=result.message.split('\n\n').filter(p=>!avoid.some(t=>p.toLocaleLowerCase().includes(t))).join('\n\n');
  if(!result.message)result.message='Thinking of you, and wishing you good things ahead.';
  return result;
}
