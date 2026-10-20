import { describe, expect, it } from 'vitest';
import { buildCatalog, permutations, speechId } from '../../tools/voice/catalog';
import { graph, createRun, departmentCatalog, serviceCatalog } from '../../src/shared/fixtures';
import { deriveRoute } from '../../src/shared/routing';
import { navigationSteps } from '../../src/client/navigationSteps';
import { navigationSpeech, normalizeSpeechText } from '../../src/shared/navigationSpeech';
const catalog = buildCatalog();
const ids = new Set(catalog.phrases.map(phrase => phrase.id));
describe('reviewed navigation voice pack', () => {
  it('covers both cardiology orders and all six internal medicine orders', () => {
    expect(permutations([1, 2, 3])).toHaveLength(6);
    expect(catalog.journeys.filter(journey => journey.departmentId === 'DEMO-CARDIOLOGY')).toHaveLength(2);
    expect(catalog.journeys.filter(journey => journey.departmentId === 'DEMO-INTERNAL')).toHaveLength(6);
    expect(new Set(catalog.journeys.map(journey => journey.order.join(','))).size).toBe(8);
    expect(catalog.stats.mixedTransportCombinations).toBe(224);
    for (const journey of catalog.journeys) {
      expect(journey.stops[0]).toBe('DEMO-RECEPTION');
      expect(journey.stops.at(-1)).toBe(journey.stops[1]);
      expect(journey.announcements.every(id => ids.has(id))).toBe(true);
    }
  });
  it('has an exact recording for every displayed step, arrival and reroute in all eight journeys', () => {
    const base = createRun().visits[0];
    for (const journey of catalog.journeys) for (const leg of journey.legs) for (const transportMode of ['lift', 'stairs'] as const) {
      let from = leg.from;
      for (let guard = 0; guard < 20; guard++) {
        const route = deriveRoute({ ...base, locationId: from, transportMode }, leg.to);
        expect(ids.has(speechId(navigationSpeech(graph, route)))).toBe(true);
        if (from === leg.to) break;
        const step = navigationSteps(graph, route)[0];
        expect(step).toBeDefined();expect(step.to.id).not.toBe(from);
        from = step.to.id;
      }
      expect(from).toBe(leg.to);
    }
  }, 30_000);
  it('covers switching transport, backtracking and a position updated anywhere in the graph', () => {
    const destinations=new Set(['DEMO-RECEPTION','DEMO-ENTRANCE',...departmentCatalog.map(item=>item.locationId),...serviceCatalog.map(item=>item.locationId)]);
    expect(catalog.routes).toHaveLength(graph.locations.length * destinations.size * 2);
    expect(new Set(catalog.routes.map(route=>route.to))).toEqual(destinations);
    expect(catalog.routes.every(route => ids.has(route.normal) && ids.has(route.rerouted))).toBe(true);
    expect(new Set(catalog.routes.map(route => `${route.from}:${route.to}:${route.transportMode}`)).size).toBe(catalog.routes.length);
  });
  it('covers the reported A205 to dermatology A405 route and all stages of every destination',()=>{
    const base=createRun().visits[0];
    const route=deriveRoute({...base,locationId:'DEMO-SINHHOA'},'DEMO-DALIEU');
    expect(ids.has(speechId(navigationSpeech(graph,route)))).toBe(true);
    for(const destination of new Set(catalog.routes.map(item=>item.to)))for(const mode of ['lift','stairs'] as const){
      let from='DEMO-RECEPTION';
      for(let guard=0;guard<20;guard++){
        const route=deriveRoute({...base,locationId:from,transportMode:mode},destination);
        expect(ids.has(speechId(navigationSpeech(graph,route)))).toBe(true);
        if(from===destination)break;
        from=navigationSteps(graph,route)[0].to.id;
      }
      expect(from).toBe(destination);
    }
  },30_000);
  it('deduplicates exact spoken text and contains no personal identifiers or medical preparation advice', () => {
    expect(ids.size).toBe(catalog.phrases.length);
    expect(new Set(catalog.phrases.map(phrase => phrase.text)).size).toBe(catalog.phrases.length);
    for (const phrase of catalog.phrases) {
      expect(phrase.text.length).toBeGreaterThan(5);expect(phrase.text.length).toBeLessThanOrEqual(1000);
      expect(phrase.text).not.toMatch(/\d|Nguyễn Minh Anh|DEMO-P|nhịn ăn|uống thuốc/);
      expect(phrase.id).toBe(speechId(phrase.text));
      expect(normalizeSpeechText(phrase.text)).toBe(phrase.text);
      expect(phrase.text).not.toMatch(/đường màu xanh|\.\./i);
    }
  });
  it('speaks the visible description alone on every navigable route', () => {
    const base=createRun().visits[0];
    for(const item of catalog.routes){
      const route=deriveRoute({...base,locationId:item.from,transportMode:item.transportMode},item.to);
      const step=navigationSteps(graph,route)[0];
      if(!step)continue;
      expect(navigationSpeech(graph,route)).toBe(step.detail);
      expect(item.normal).toBe(item.rerouted);
      if(step.to.roomNumber)expect(step.detail.match(new RegExp(step.to.roomNumber,'g'))).toHaveLength(1);
    }
  },30_000);
  it('uses stable Vietnamese pronunciations and one normalization for online and recorded audio', () => {
    expect(normalizeSpeechText('Tới phòng A201 · Nội, tầng 2, Tòa A.. ')).toBe('Tới phòng a hai không một, Nội, tầng hai, Tòa a.');
    expect(normalizeSpeechText('Sang Tòa B, phòng B105.')).toBe('Sang Tòa bê, phòng bê một không năm.');
    expect(speechId('Tới A201..')).toBe(speechId('Tới a hai không một.'));
  });
});
