const {chromium}=require('/home/hector/.nvm/versions/node/v24.18.0/lib/node_modules/@playwright/cli/node_modules/playwright');
const assert=require('node:assert/strict');
const site=process.env.SITE_URL || 'http://127.0.0.1:4321';
const sedes=require('../src/data/sedes.json');
const regions={};sedes.forEach(s=>{regions[s.region]=(regions[s.region]||0)+1});
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 const ctx=await b.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce',geolocation:{latitude:-6.7714,longitude:-79.8409},permissions:['geolocation']});
 const p=await ctx.newPage();const errors=[];const tileRequests=[];p.on('request',r=>{if(r.url().includes('tile.openstreetmap.org'))tileRequests.push(r.url())});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`${site}/#sedes`,{waitUntil:'networkidle'});
 await p.locator('#sedes').scrollIntoViewIfNeeded();
 await p.locator('.leaflet-control-zoom').waitFor();
 const search=p.locator('#location-search'),items=p.locator('.location-entry:visible'),count=p.locator('#location-count');
 const rendered=await p.locator('.location-entry').evaluateAll(es=>es.map(e=>({slug:e.dataset.slug,href:e.querySelector('h3 a').getAttribute('href'),lat:e.dataset.lat?Number(e.dataset.lat):null,lng:e.dataset.lng?Number(e.dataset.lng):null})));
 assert.deepEqual(rendered,sedes.map(s=>({slug:s.slug,href:`/sedes/${s.slug}`,lat:s.lat,lng:s.lng})),'Every church links to its page and keeps its coordinates');

 // La lista se muestra por partes para no abrumar.
 assert.equal(await items.count(),12);
 await p.locator('[data-more]').click();assert.equal(await items.count(),24);

 for(const [name,total] of Object.entries(regions)){
  await p.locator(`.finder-regions [data-region="${name}"]`).click();
  assert.equal(await p.locator('.location-entry:not([hidden]), .location-entry[hidden]').evaluateAll((es,r)=>es.filter(e=>e.dataset.region===r).length,name),total);
  assert.match(await count.textContent(),new RegExp(`${total} iglesia`),name);
 }
 await p.locator('.finder-regions [data-region=""]').click();

 await search.fill('jaen');assert.equal(await items.count(),3,'Accent-insensitive city');
 await search.fill('chiclaio');assert.ok(await items.count()>0,'Typo tolerant');assert.match(await count.textContent(),/parecidos/);
 await search.fill('incahuasi');assert.ok(await items.count()>=4,'Spelling variants');
 await search.fill('678');assert.equal(await items.count(),1);assert.match(await items.textContent(),/La Florida 678/);
 await search.fill('San Antonio');await items.first().locator('.location-map-button').click();
 await p.locator('.leaflet-popup').waitFor();assert.match(await p.locator('.leaflet-popup').textContent(),/Ver esta iglesia/);
 await search.fill('no-existe-iglesia');assert.equal(await items.count(),0);assert.ok(await p.locator('.locations-empty').isVisible());
 await p.locator('[data-clear-locations]').click();assert.equal(await search.inputValue(),'');assert.equal(await items.count(),12);

 await p.locator('[data-near]').click();await p.locator('.location-distance:visible').first().waitFor();
 assert.match(await count.textContent(),/más cercana/);assert.ok(await p.locator('.user-pin').isVisible());
 await p.locator('[data-reset-order]').click();assert.equal(await p.locator('.location-distance:visible').count(),0);

 for(const width of [1440,768,390,320]){
  await p.setViewportSize({width,height:1100});
  await p.goto(`${site}/#sedes`,{waitUntil:'networkidle'});await p.waitForTimeout(250);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  await p.goto(`${site}/sedes/${sedes[0].slug}`,{waitUntil:'networkidle'});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Sede overflow '+width);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(tileRequests,[],'Blocked tile provider must not be requested');
 console.log(`PASS: ${sedes.length} sedes enlazadas, regiones, búsqueda con tildes y errores, cercanía, mapa, vacío, 320/390/768/1440px.`);
 // La lista sigue siendo útil si fallan los scripts del mapa.
 const fallback=await b.newPage();await fallback.route('**/assets/vendor/*.js',r=>r.abort());
 await fallback.goto(`${site}/#sedes`);await fallback.locator('#sedes').scrollIntoViewIfNeeded();await fallback.waitForTimeout(400);
 await fallback.locator('#location-search').fill('Motupe');assert.ok(await fallback.locator('.location-entry:visible').count()>=1);assert.match(await fallback.locator('#map-status').textContent(),/no está disponible/);
 console.log('PASS: map dependency failure preserves searchable directory.');
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
