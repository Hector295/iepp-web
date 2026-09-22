const {chromium}=require('/home/hector/.nvm/versions/node/v24.18.0/lib/node_modules/@playwright/cli/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});const errors=[];const tileRequests=[];p.on('request',r=>{if(r.url().includes('tile.openstreetmap.org'))tileRequests.push(r.url())});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`${process.env.SITE_URL || 'http://127.0.0.1:4321'}/#sedes`,{waitUntil:'networkidle'});
 await p.locator('#sedes').scrollIntoViewIfNeeded();
 await p.locator('.leaflet-control-zoom').waitFor();
 const search=p.locator('#location-search'),region=p.locator('#location-region'),items=p.locator('.location-entry:visible');
 const expected=require('../public/assets/locations-data.json');
 const rendered=await p.locator('.location-entry').evaluateAll(es=>es.map(e=>({name:e.querySelector('h3').textContent,lat:Number(e.dataset.lat),lng:Number(e.dataset.lng),precision:e.dataset.precision,query:new URL(e.querySelector('a').href).searchParams.get('query')})));
 assert.deepEqual(rendered,expected.map(e=>({name:e.name,lat:e.lat,lng:e.lng,precision:e.precision,query:`${e.lat.toFixed(6)},${e.lng.toFixed(6)}`})),'Every coordinate, precision category and Google Maps point matches the supplied data');
 for(const name of ['San Antonio','Puerto Eten','Piedras Vivas Trujillo','Motupe','Sede Nacional Chiclayo']) {
   const entry=expected.find(e=>e.name===name);
   await search.fill(name);await p.locator(`.location-entry[data-number="${entry.id}"] button`).click();
   await p.locator('.leaflet-popup').waitFor();
   assert.ok((await p.locator('.leaflet-popup').textContent()).includes(entry.lat.toFixed(6)));
   const pin=p.locator(`.leaflet-marker-icon[title="${name}"]`);
   assert.equal((await pin.getAttribute('class')).includes('church-pin-approx'),entry.precision==='APROX_LOCALIDAD','Marker styling reflects '+entry.precision);
 }
 await search.fill('');

 assert.equal(await items.count(),42);
 assert.equal(await p.locator('.location-entry a').count(),42);
 for(const [name,count] of Object.entries({'Norte':12,'Sur':8,'Nor Oriente':5,'Oriente':4,'Nor Andina':11,'Ucayali':2})){
  await region.selectOption(name);assert.equal(await items.count(),count,name);
 }
 await region.selectOption('');
 await search.fill('jaen');assert.equal(await items.count(),3,'Accent-insensitive city');
 await search.fill('  san  martin ');assert.ok(await items.count()>=4,'Multiple words and whitespace');
 await search.fill('678');assert.equal(await items.count(),1);assert.match(await items.textContent(),/La Florida 678/);
 await search.fill('HCQR+9QF');assert.equal(await items.count(),1);
 await items.locator('button').click();await p.locator('.leaflet-popup').waitFor();assert.match(await p.locator('.leaflet-popup').textContent(),/15 de Febrero/);
 await search.fill('no-existe-iglesia');assert.equal(await items.count(),0);assert.ok(await p.locator('.locations-empty').isVisible());assert.ok(await p.locator('[data-fit-locations]').isDisabled());
 await p.locator('[data-clear-locations]').click();assert.equal(await items.count(),42);assert.equal(await search.inputValue(),'');
 await p.locator('[data-peru-view]').click();
 for(const width of [1440,768,390,320]){
  await p.setViewportSize({width,height:1100});await p.locator('#sedes').scrollIntoViewIfNeeded();
  await p.waitForTimeout(250);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  assert.ok(await p.locator('.locations-directory').evaluate(el=>el.scrollWidth<=el.clientWidth),'Directory overflow '+width);
  await p.locator('#sedes').screenshot({path:`/tmp/iepp-sedes-${width}.png`});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(tileRequests,[],'Blocked tile provider must not be requested');
 console.log('PASS: 42 sedes, six region counts, accents, combined terms, addresses and Plus Codes, selection and popup, empty/reset state, 320/390/768/1440px, no page errors.');
 assert.equal(await p.locator('.leaflet-tile').count(),0,'Local map must not request external tiles');
 assert.ok(await p.locator('.leaflet-overlay-pane path').count()>0,'Local Peru geometry is visible');
 // Local list and direct links remain useful if map scripts are unavailable.
 const fallback=await b.newPage();await fallback.route('**/assets/vendor/*.js',r=>r.abort());
 await fallback.goto(`${process.env.SITE_URL || 'http://127.0.0.1:4321'}/#sedes`);await fallback.locator('#sedes').scrollIntoViewIfNeeded();await fallback.waitForTimeout(400);
 await fallback.locator('#location-search').fill('Motupe');assert.equal(await fallback.locator('.location-entry:visible').count(),1);assert.match(await fallback.locator('#map-status').textContent(),/no está disponible/);
 console.log('PASS: map dependency failure preserves searchable directory.');
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
