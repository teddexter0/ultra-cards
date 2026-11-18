const grid = (families, finishes, make) => families.flatMap((family, i) =>
  finishes.map((finish, j) => ({name: `${family} · ${finish}`, ...make(i, j)})));

const inks = ['#164637','#702f52','#8f350b','#243e86','#503188','#215763','#853344','#242120','#72511c','#29375c'];
const tints = ['#ebfaf4','#fff0f7','#fff0e1','#edf2ff','#f4ebff','#dff9ff','#ffe8e9','#f1eee9','#fff9d5','#edefff'];
const colors = ['Pine','Berry','Paprika','Cobalt','Iris','Lagoon','Rose','Ink','Gold','Twilight'];
const shades = ['Mist','Soft','Midtone','Rich','Deep'];
const tones = ['#ffebbb','#ffd1e7','#c0eaff','#d2c5ff','#b9ffd9'];
const paint = ['Sun','Rose','Ice','Lilac','Mint'];
const swatches = grid(colors, shades, (i,j) => ({
  value:`color-mix(in srgb, ${inks[i]} ${25+j*16}%, ${tints[i]})`,
  ink:j < 3 ? '#15151b' : '#fff',
}));

const patterns = [
  ['Silk', t=>`linear-gradient(135deg,${t},transparent 36%,${t} 72%,transparent)`],
  ['Dunes', t=>`repeating-radial-gradient(ellipse at 20% 120%,${t} 0 44px,transparent 46px 89px)`],
  ['Polka dots', t=>`radial-gradient(${t} 2px,transparent 3px) 0 0 / 24px 24px`],
  ['Circus stripes', t=>`repeating-conic-gradient(from -10deg at 50% 5%,${t} 0 12deg,transparent 12deg 24deg)`],
  ['Graph paper', t=>`repeating-linear-gradient(90deg,${t} 0 1px,transparent 1px 28px),repeating-linear-gradient(${t} 0 1px,transparent 1px 28px)`],
  ['Moon rings', t=>`repeating-radial-gradient(circle at 78% 15%,transparent 0 36px,${t} 37px 41px)`],
  ['Horizon', t=>`radial-gradient(circle at 68% 22%,${t} 0 8%,transparent 8.5%),linear-gradient(0deg,${t} 12%,transparent 57%)`],
  ['Checkerboard', t=>`conic-gradient(${t} 25%,transparent 0 50%,${t} 0 75%,transparent 0) 0 0 / 40px 40px`],
  ['Bokeh', t=>`radial-gradient(circle at 20% 15%,${t},transparent 12%),radial-gradient(circle at 83% 29%,${t},transparent 24%),radial-gradient(circle at 10% 68%,${t},transparent 32%)`],
  ['Diagonal ribbon', t=>`repeating-linear-gradient(125deg,transparent 0 62px,${t} 62px 78px,transparent 78px 122px)`],
];
const lightShapes = ['Overhead','Footlights','Upper left','Upper right','Horizon glow','Twin spots','Backlight','Crosslight','Vignette','Light sweep'];
const spotlight = ['ellipse at 50% 0%','ellipse at 50% 100%','circle at 5% 5%','circle at 95% 5%','ellipse at 50% 72%','circle at 15% 30%','circle at 50% 45%','ellipse at 85% 85%','circle at 50% 50%','ellipse at 20% 80%'];
const faces = ['Cormorant Garamond','Playfair Display','Manrope','Space Grotesk','DM Sans','Georgia','Trebuchet MS','Palatino Linotype','Courier New','Arial'];
const treatments = [[400,'normal'],[600,'normal'],[700,'normal'],[400,'italic'],[700,'italic']];
const cuts = [
  d=>`polygon(${d}% 0,${100-d}% 0,100% ${d}%,100% 100%,0 100%,0 ${d}%)`,
  d=>`polygon(0 0,100% 0,100% ${100-d}%,${100-d}% 100%,${d}% 100%,0 ${100-d}%)`,
  d=>`polygon(${d}% 0,${100-d}% 0,100% ${d}%,100% ${100-d}%,${100-d}% 100%,${d}% 100%,0 ${100-d}%,0 ${d}%)`,
  d=>`polygon(0 0,100% 0,${100-d}% 100%,${d}% 100%)`,
  d=>`polygon(${d}% 0,${100-d}% 0,100% 100%,0 100%)`,
  d=>`polygon(0 0,100% 0,100% ${100-d}%,50% 100%,0 ${100-d}%)`,
  d=>`polygon(50% 0,100% ${d}%,100% 100%,0 100%,0 ${d}%)`,
  d=>`polygon(${d}% 0,100% 0,${100-d}% 100%,0 100%)`,
  d=>`polygon(0 0,${100-d}% 0,100% 100%,${d}% 100%)`,
  d=>`polygon(0 0,100% 0,100% 42%,${100-d}% 50%,100% 58%,100% 100%,0 100%,0 58%,${d}% 50%,0 42%)`,
];
const glyphs = ['✦','★','☾','☀','☁','☄','❋','✿','❀','❁','♣','❧','⚘','❦','❃','♥','♡','♦','♠','♔','♫','♪','♬','♭','♯','⚑','⚓','⌂','✈','☂','⚡','☕','⚽','♟','∞','✉','✎','⌘','✂','✐','❄','☃','☘','☮','☯','☼','◈','◎','◉','◌'];
const glyphNames = ['Spark','Star','Moon','Sun','Cloud','Comet','Petals','Blossom','Flower','Daisy','Clover','Leaf','Stem','Vine','Rosette','Heart','Outline heart','Diamond','Spade','Crown','Music notes','Note','Beamed notes','Flat','Sharp','Flag','Anchor','Home','Plane','Umbrella','Lightning','Coffee','Football','Chess','Infinity','Letter','Pencil','Command','Scissors','Pen','Snowflake','Snowman','Shamrock','Peace','Yin and yang','Sunburst','Gem','Target','Dot','Ring'];
const moves = ['Slide right','Slide left','Drop down','Rise up','From afar','Spin','Flip','Curtain','Confetti','Circus bounce'];
const moveKeys = ['right','left','down','up','depth','spin','flip','curtain','confetti','circus'];

export const designOptions = {
  movement: grid(moves,['Quick','Slow','On scroll','Loop','Envelope + note'],(i,j)=>({key:moveKeys[i],trigger:['open','open','scroll','loop','both'][j],duration:['.65s','1.65s','1s','3s','1.05s'][j]})),
  backdrop: grid(patterns.map(([name])=>name),paint,(i,j)=>({value:patterns[i][1](tones[j]+'68')})),
  lighting: grid(lightShapes,paint,(i,j)=>({value:i===8 ? `radial-gradient(${spotlight[i]},transparent 38%,${tones[j]}85 100%)` : `radial-gradient(${spotlight[i]},${tones[j]}a8,transparent 65%)${i===5?`,radial-gradient(circle at 85% 30%,${tones[j]}88,transparent 50%)`:''}`})),
  type: grid(faces,['Regular','Semibold','Bold','Italic','Bold italic'],(i,j)=>({family:`"${faces[i]}", ${[0,1,5,7].includes(i)?'serif':i===8?'monospace':'sans-serif'}`,weight:treatments[j][0],style:treatments[j][1]})),
  size: Array.from({length:50},(_,i)=>({name:`${76+i}%`,value:(76+i)/100})),
  envelopeShape: grid(['Cut top','Cut bottom','Chamfered','Lampshade','Fan','Shield','Roof','Slant right','Slant left','Ticket'],['Subtle','Small','Medium','Large','Deep'],(i,j)=>({value:cuts[i](4+j*4)})),
  envelopeColor: swatches,
  seal: glyphs.map((glyph,i)=>({name:glyphNames[i],glyph})),
  emphasis: grid(['Spotlight','Underline','Metallic','Outline','Glow','Sparkle','Ribbon','Double rule','Halo','Confetti stamp'],['Delicate','Soft','Classic','Strong','Extra'],(i,j)=>({style:i,strength:j+1})),
  emphasisColor: swatches,
};

export function publicDesign(card) {
  const source = card.design || {};
  const design = {};
  for (const [key, choices] of Object.entries(designOptions)) {
    if (Number.isInteger(source[key]) && choices[source[key]]) design[key] = source[key];
  }
  if (Array.isArray(source.highlights)) {
    const seen = new Set();
    design.highlights = source.highlights.slice(0,3).flatMap(value => {
      const phrase = typeof value === 'string' ? value.trim().slice(0,60) : '';
      const key = phrase.toLowerCase();
      if (!phrase || seen.has(key)) return [];
      seen.add(key);
      return [phrase];
    });
  }
  return design;
}

export function highlightText(text, phrases, seen, escape) {
  const keys = new Set(phrases.map(phrase=>phrase.toLowerCase()));
  const pattern = [...phrases].sort((a,b)=>b.length-a.length)
    .map(phrase=>phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  if (!pattern) return escape(text).replaceAll('\n','<br>');
  let cursor=0;
  let html='';
  const format = value => escape(value).replaceAll('\n','<br>');
  for (const match of text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`,'giu'))) {
    const [value] = match;
    const key = value.toLowerCase();
    if (!keys.has(key) || seen.has(key)) continue;
    html += format(text.slice(cursor,match.index))+`<mark>${format(value)}</mark>`;
    seen.add(key);
    cursor=match.index+value.length;
  }
  return html+format(text.slice(cursor));
}
