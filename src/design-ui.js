import {designOptions, publicDesign, highlightText} from './design.js';
import {escapeHTML as esc} from './engine.js';

const labels = {
  movement:'Motion preset', backdrop:'Background pattern', lighting:'Lighting', type:'Lettering',
  size:'Headline scale', envelopeShape:'Envelope shape', envelopeColor:'Envelope colour', seal:'Seal icon',
  emphasis:'Highlight effect', emphasisColor:'Highlight colour',
};

function choice(card, key) {
  return `<label>${labels[key]}<select name="design-${key}"><option value="">Template default</option>${designOptions[key].map((item,i) => `<option value="${i}" ${card.design?.[key]===i?'selected':''}>${item.glyph?item.glyph+' ':''}${esc(item.name)}</option>`).join('')}</select></label>`;
}

export function designControls(card) {
  const group = (title, keys) => `<details class="design-panel"><summary>${title}</summary><div class="field-pair">${keys.map(key=>choice(card,key)).join('')}</div></details>`;
  return group('Background and lighting',['backdrop','lighting','type','size']) +
    group('Envelope and motion',['envelopeShape','envelopeColor','seal','movement']) +
    '<button class="outline full" type="button" id="test-envelope">Test envelope and motion</button>';
}

export function emphasisControls(card) {
  return `<fieldset class="phrase-controls"><legend>Make up to three phrases stand out</legend><p class="small-note">Enter words already in your headline or note. Each phrase shines on its first appearance.</p><div class="phrase-grid">${Array.from({length:3},(_,i)=>`<label>Phrase ${i+1}<input name="phrase-${i}" maxlength="60" value="${esc(card.design?.highlights?.[i])}"></label>`).join('')}</div><div class="field-pair">${choice(card,'emphasis')}${choice(card,'emphasisColor')}</div><p class="small-note" id="phrase-missing" aria-live="polite"></p></fieldset>`;
}

export function captureDesign(card, fields) {
  const design = {...card.design};
  for (const key of Object.keys(designOptions)) {
    const field = fields.namedItem(`design-${key}`);
    if (field) design[key] = field.value === '' ? undefined : Number(field.value);
  }
  if (fields.namedItem('phrase-0')) design.highlights = Array.from({length:3},(_,i)=>fields.namedItem(`phrase-${i}`).value);
  card.design = design;
}

export function appearance(card, scene) {
  const design = publicDesign(card);
  const pick = key => designOptions[key][design[key]];
  const type = pick('type');
  const move = pick('movement');
  const effect = pick('emphasis') || {style:5,strength:3};
  const emphasis = pick('emphasisColor');
  const envelope = pick('envelopeColor');
  const style = {
    '--paper':scene.color,'--ink':scene.ink,'--accent':/^#[\da-f]{6}$/i.test(card.color||'')?card.color:scene.accent,
    '--display':scene.font,'--custom-type':type?.family,'--custom-weight':type?.weight,'--custom-style':type?.style,
    '--headline-scale':pick('size')?.value,'--backdrop':pick('backdrop')?.value,'--lighting':pick('lighting')?.value,
    '--mark-color':emphasis?.value,'--mark-ink':emphasis?.ink,'--mark-strength':effect.strength,
    '--preset-animation':move&&`design-${move.key}`,'--preset-time':move?.duration,
  };
  return {
    style:Object.entries(style).filter(([,value])=>value!==undefined).map(([key,value])=>`${key}:${value}`).join(';'),
    envelopeStyle:[pick('envelopeShape')&&`--envelope-shape:${pick('envelopeShape').value}`,envelope&&`--envelope-color:${envelope.value};--envelope-ink:${envelope.ink}`,move&&`--preset-animation:design-${move.key};--preset-time:${move.duration}`].filter(Boolean).join(';'),
    seal:pick('seal')?.glyph, move, effect:effect.style,
    customType:Boolean(type), highlight:(text,seen)=>highlightText(text,design.highlights||[],seen,esc),
  };
}

export function connectScrollMotion(root) {
  const animated = root.querySelector('[data-trigger="scroll"]');
  if (!animated || !('IntersectionObserver' in window)) return () => {};
  const observer = new IntersectionObserver(([entry]) => {
    animated.classList.toggle('in-view', entry.isIntersecting);
  }, {rootMargin:'-12% 0px -12% 0px'});
  observer.observe(animated);
  return () => observer.disconnect();
}
