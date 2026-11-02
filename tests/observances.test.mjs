import test from 'node:test';
import assert from 'node:assert/strict';
import {parseObservances,observancesForYear} from '../scripts/observances.mjs';

test('official calendar parser keeps date facts and strips markup and resolutions',()=>{
  const rows=parseObservances('<p>14 Nov | <a href="https://www.un.org">World Diabetes Day</a> (A/RES/61/225)</p><p>20 Nov | World Children&#039;s Day</p>');
  assert.deepEqual(rows,[{month:11,day:14,name:'World Diabetes Day'},{month:11,day:20,name:"World Children's Day"}]);
});
test('moving international days are recalculated rather than copied from a source year',()=>{
  const events=observancesForYear([{month:11,day:20,name:'World Philosophy Day'}],2026);
  assert.equal(events.find(e=>e.name==='World Philosophy Day').date,'2026-11-19');
  assert.equal(events.find(e=>e.name==='World Habitat Day').date,'2026-10-05');
  assert.equal(events.find(e=>e.name==='World Day of Remembrance for Road Traffic Victims').date,'2026-11-15');
  assert.equal(events.find(e=>e.name==='World Maritime Day').date,'2026-09-24');
});
