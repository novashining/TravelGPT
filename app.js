'use strict';
const $=id=>document.getElementById(id);
const defaults={adventure:'snorkel',citydate:'5',rain:'dry'};
const valid={adventure:['snorkel','zoo'],citydate:['4','5','6'],rain:['dry','wet']};
let state={...defaults};
try{state={...defaults,...JSON.parse(localStorage.getItem('travelgpt-family-v2')||'{}')}}catch{}
const params=new URLSearchParams(location.search);
for(const key of Object.keys(defaults)){if(valid[key].includes(params.get(key)))state[key]=params.get(key);if(!valid[key].includes(state[key]))state[key]=defaults[key]}
const requestedDay = params.get('day');
let selected = /^[1-8]$/.test(requestedDay || '') ? Number(requestedDay) - 1 : 0;
let returnFocus = null;
const maps=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
const base={
arrival:{id:'arrival',image:'hero',alt:'Miami’s skyline glowing pink at sunset',place:'HELLO, MIAMI',theme:'Arrival',title:'A fresh start, Miami style.',plan:[['On the way','Travel to Miami.'],['Settle in','Pick up the rental car and check in.'],['After dark','New Year’s Eve at CityPlace Doral, or a cozy early night.']],links:[['CityPlace Doral map',maps('CityPlace Doral Miami')]],description:'Touch down, settle in, and swap winter for a little South Florida warmth. New Year’s Eve can be a stroll around CityPlace Doral or an easy night together.'},
everglades:{id:'everglades',image:'shark-valley-tower',alt:'The Shark Valley Observation Tower and its winding ramp above the wetlands',place:'SHARK VALLEY OBSERVATION TOWER',theme:'Wild Florida',title:'Shark Valley & an airboat ride',plan:[['Morning','Bike the 15-mile Shark Valley loop or ride the narrated tram. Stop at the observation tower for a view across the sawgrass.'],['Afternoon','An airboat ride through the wetlands with Coopertown.'],['Evening','Dinner, then a well-earned rest.']],links:[['Shark Valley','https://www.sharkvalleytramtours.com/'],['Coopertown airboats','https://www.coopertownairboats.com/'],['Map',maps('Shark Valley Visitor Center')]],description:'A new year in the wild: alligator spotting at Shark Valley, wide-open wetlands, and an airboat ride. Bring a camera and a little sense of adventure.'},
snorkel:{id:'adventure',image:'snorkel',alt:'A snorkeler exploring tropical fish and coral in Biscayne National Park',place:'BISCAYNE NATIONAL PARK',theme:'Ocean adventure',title:'Go where the fish are.',plan:[['Morning','A relaxed wander around Coconut Grove.'],['Afternoon','Biscayne snorkeling, planned for 1:30–5 pm.'],['Evening','Dinner by the marina.']],note:'Weather dependent. We’ll choose Zoo Miami if the ocean is too rough or cold. A reef visit is not guaranteed.',links:[['Snorkeling tour','https://www.biscaynenationalparkinstitute.org/coconut-grove-snorkel/'],['Marina map',maps('Dinner Key Marina Miami')]],description:'Blue water, tropical fish, and a peek into Biscayne’s underwater world. This is our fair-weather adventure; Zoo Miami is the backup if marine conditions don’t cooperate.'},
zoo:{id:'adventure',image:'zoo',alt:'Pink flamingos reflected in a pond at Zoo Miami',place:'ZOO MIAMI',theme:'Wildlife day',title:'A day with the tall crowd.',plan:[['Morning','Head to Zoo Miami for giraffes, elephants, and more.'],['Afternoon','Take our time exploring the animal exhibits.'],['Evening','Dinner and an easy night.']],note:'Our full-day alternative if snorkeling weather is unfavorable.',links:[['Zoo Miami','https://www.zoomiami.org/'],['Map',maps('Zoo Miami')]],description:'A whole day for giraffes, elephants, and animal encounters. Our land-based adventure if the ocean has other plans.'},
transfer:{id:'transfer',image:'vizcaya',alt:'The historic Vizcaya villa and formal gardens',place:'VIZCAYA + LITTLE HAVANA',theme:'Culture & coast',title:'Garden paths to ocean views.',plan:[['Morning','Explore Vizcaya’s mansion and gardens.'],['Afternoon','Cuban lunch in Little Havana. Return the car and move to South Beach.'],['Evening','South Pointe Park, sea air, and dinner.']],links:[['Vizcaya','https://vizcaya.org/visit/'],['Little Havana map',maps('Domino Park Little Havana')],['South Pointe map',maps('South Pointe Park Miami Beach')]],description:'A morning among Vizcaya’s gardens, Cuban flavors in Little Havana, then our move to South Beach. We’ll finish the day with a walk at South Pointe Park.'},
mid:{id:'mid',image:'deco',alt:'Palm trees and colorful Art Deco hotels along Ocean Drive',place:'MID BEACH + SOUTH BEACH',theme:'Beach mode',title:'Let the beach set the pace.',plan:[['Morning','Take the free Collins Express trolley to Mid Beach and stroll the boardwalk.'],['Afternoon','South Beach time, around noon–4:30 pm.'],['Evening','Ocean Drive and its colorful Art Deco buildings.']],links:[['Free trolley','https://www.miamibeachfl.gov/city-hall/transportation/trolley/'],['Beach map',maps('South Beach Miami Beach')]],description:'A trolley ride, a boardwalk stroll, and an afternoon reserved for the beach. We’ll save the warmest days for ocean time.'},
city:{id:'city',image:'frost',alt:'The circular aquarium window at Frost Science with sharks and rays overhead',place:'WYNWOOD + FROST SCIENCE',theme:'City discoveries',title:'Color outside the lines.',plan:[['Morning','Open-top Big Bus and the murals of Wynwood Walls.'],['Afternoon','Frost Science: aquarium, planetarium, then Bayside Marketplace.'],['Evening','Optional: Luminosa at Jungle Island, if running on our dates.']],note:'Choose a cooler, dry day for the bus and pack a light jacket. If it rains, take an Uber to Frost Science instead.',links:[['Big Bus','https://www.bigbustours.com/en/miami/red-route-miami'],['Frost Science','https://www.frostscience.org/plan-your-day/'],['Jungle Island','https://www.jungleisland.com/']],description:'A day of larger-than-life murals, city views, and sharks overhead at Frost Science. We can move this day around to leave the best weather for the beach.'},
garden:{id:'garden',image:'espanola',alt:'Palm trees and Spanish-style architecture along Española Way',place:'GARDENS + SOUTH BEACH',theme:'Beach mode',title:'A little green. A lot of blue.',plan:[['Morning','Botanical Garden, Holocaust Memorial, and Lincoln Road by trolley.'],['Afternoon','Back to South Beach, around noon–4:30 pm.'],['Evening','A stroll along Española Way and dinner.']],links:[['Botanical Garden','https://www.mbgarden.org/visit'],['Map',maps('Miami Beach Botanical Garden')]],description:'A peaceful garden morning, a walk along Lincoln Road, and another afternoon with the ocean. Española Way is our evening change of scenery.'},
departure:{id:'departure',image:'pier',alt:'South Pointe Pier and the turquoise Miami Beach shoreline from above',place:'ONE LAST LOOK',theme:'Homeward bound',title:'One more dose of sea air.',plan:[['Morning','A last beach walk or short trolley ride, if time allows.'],['Check out','Leave time for the hotel checkout and airport transfer.'],['Homeward','Bring the memories. Leave the sand.']],note:'Timing depends on our flight.',links:[],description:'One last look at the ocean before heading home. The morning stays flexible around our flight.'}
};
function days(){const c=Number(state.citydate),g=c===6?5:6;return [base.arrival,base.everglades,state.adventure==='zoo'?base.zoo:base.snorkel,base.transfer,...[4,5,6].map(i=>i===c?getCity():i===g?base.garden:base.mid),base.departure]}
function getCity(){if(state.rain==='dry')return base.city;return {...base.city,title:'A little rain. A lot of wonder.',place:'FROST SCIENCE',plan:[['Morning','Take an Uber to downtown Miami.'],['Afternoon','Frost Science’s aquarium, planetarium, and indoor exhibits.'],['Evening','Dinner. Luminosa only if rain clears and the event is running.']],note:'Skip the open-top bus and outdoor stops in the rain.'}}
const weekdays=['THU','FRI','SAT','SUN','MON','TUE','WED','THU'];
const dateShort=i=>i===0?'Dec 31':'Jan '+i;
const dateLong=i=>(i===0?'Thursday, December 31':'Friday Saturday Sunday Monday Tuesday Wednesday Thursday'.split(' ')[i-1]+', January '+i);
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function save(){try{localStorage.setItem('travelgpt-family-v2',JSON.stringify(state))}catch{}}
const shortTitles = {
  arrival: 'Arrival', everglades: 'Everglades', transfer: 'Vizcaya',
  mid: 'Ocean Drive', city: 'City day', garden: 'Gardens', departure: 'Home'
};
function shortTitle(day) {
  if (day.id === 'adventure') return state.adventure === 'zoo' ? 'Zoo Miami' : 'Biscayne';
  return shortTitles[day.id];
}
function dayChoices(day) {
  const choices = day.id === 'adventure'
    ? { key: 'adventure', values: [['snorkel', 'Biscayne'], ['zoo', 'Zoo Miami']] }
    : day.id === 'city'
      ? { key: 'rain', values: [['dry', 'Dry day'], ['wet', 'Rainy day']] }
      : null;
  if (!choices) return '';
  return `<div class="day-choices" role="group" aria-label="Choose the day plan">${choices.values.map(([value,label]) =>
    `<button class="small-button" data-choice="${choices.key}" data-value="${value}" aria-pressed="${state[choices.key] === value}">${label}</button>`
  ).join('')}</div>`;
}
const sharkValleyPhotos = [
  { image: 'shark-valley-tower', label: 'Tower', place: 'Shark Valley Observation Tower',
    alt: 'The winding path and elevated ramp to Shark Valley Observation Tower under a blue sky' },
  { image: 'shark-valley-bike', label: 'Bike loop', place: 'Shark Valley Tram Road',
    alt: 'Cyclists riding the paved Shark Valley loop through the Everglades' },
  { image: 'gator', label: 'Wildlife', place: 'Alligator at Shark Valley',
    alt: 'An American alligator among lily pads at Shark Valley' }
];
let mediaMode = 'photo';
let photoIndex = 0;

function updateDayPhoto(day) {
  const photo = day.id === 'everglades' ? sharkValleyPhotos[photoIndex] : day;
  const image = $('day-image');
  const src = 'assets/' + photo.image + '.webp';
  if (image.getAttribute('src') !== src) image.src = src;
  image.alt = photo.alt;
  $('day-photo-view').dataset.image = photo.image;
  $('day-image-label').textContent = photo.place;
  const scenes = $('photo-scenes');
  scenes.hidden = day.id !== 'everglades';
  scenes.querySelectorAll('button').forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === photoIndex));
  });
}
for (const [i, photo] of sharkValleyPhotos.entries()) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = photo.label;
  button.setAttribute('aria-controls', 'day-image');
  button.onclick = () => {
    photoIndex = i;
    updateDayPhoto(days()[selected]);
  };
  $('photo-scenes').append(button);
}

function setMedia(mode) {
  mediaMode = mode;
  $('day-photo-view').hidden = mode !== 'photo';
  $('day-map-view').hidden = mode !== 'map';
  document.querySelectorAll('.media-toggle button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.media === mode));
  });
  renderStops();
}
document.querySelectorAll('.media-toggle button').forEach(button => {
  button.onclick = () => setMedia(button.dataset.media);
});

function render() {
  const tripDays = days();
  const day = tripDays[selected];
  $('day-tabs').innerHTML = tripDays.map((entry, i) =>
    `<button role="tab" id="tab-${i}" class="day-tab" aria-selected="${i === selected}" aria-controls="day-panel" tabindex="${i === selected ? 0 : -1}" data-index="${i}">
      <span>${weekdays[i]}</span><b>${dateShort(i)}</b><span>${shortTitle(entry)}</span>
    </button>`
  ).join('');
  $('day-panel').setAttribute('aria-labelledby', 'tab-' + selected);
  updateDayPhoto(day);
  $('day-content').innerHTML = `
    <div class="day-meta"><p class="eyebrow">${dateLong(selected)}</p><span class="day-theme">${day.theme}</span></div>
    <h3>${day.title}</h3>
    ${dayChoices(day)}
    <dl>${day.plan.map(([time, plan]) => `<div><dt>${time}</dt><dd>${plan}</dd></div>`).join('')}</dl>
    ${day.note ? `<p class="day-note">${day.note}</p>` : ''}
    <div class="day-links">${day.links.map(([text, url]) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    ).join('')}</div>
    <div class="day-navigation">
      <button id="previous" ${selected === 0 ? 'disabled' : ''}>Previous day</button>
      <button id="share-day">Share this day</button>
      <button id="next" ${selected === 7 ? 'disabled' : ''}>Next day</button>
    </div>`;
$('share-day').onclick = () => share(selected);
$('day-panel').querySelectorAll('[data-choice]').forEach(button => {
  button.onclick = () => {
    state[button.dataset.choice] = button.dataset.value;
    render();
    $('day-panel').querySelector(`[data-value="${button.dataset.value}"]`).focus({preventScroll: true});
  };
});
$('previous').onclick=()=>selectDay(selected-1,true);$('next').onclick=()=>selectDay(selected+1,true);
$('adventure-choice').value=state.adventure;$('citydate').value=state.citydate;$('rain').value=state.rain;save();renderStops();}
function selectDay(i,focus=false){const nextDay = Math.min(7, Math.max(0, i));
  if (nextDay !== selected) {
    photoIndex = 0;
    showAllStops = false;
  }
  selected = nextDay;
  render();if(focus)$('tab-'+selected).focus({preventScroll:true});const tab=$('tab-'+selected),tabs=$('day-tabs');if(tab.offsetLeft<tabs.scrollLeft)tabs.scrollLeft=tab.offsetLeft;else if(tab.offsetLeft+tab.offsetWidth>tabs.scrollLeft+tabs.clientWidth)tabs.scrollLeft=tab.offsetLeft+tab.offsetWidth-tabs.clientWidth}
$('day-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)selectDay(Number(b.dataset.index),true)});
$('day-tabs').addEventListener('keydown',e=>{let i=selected;if(e.key==='ArrowRight')i=(selected+1)%8;else if(e.key==='ArrowLeft')i=(selected+7)%8;else if(e.key==='Home')i=0;else if(e.key==='End')i=7;else return;e.preventDefault();selectDay(i,true)});
for(const [id,key] of [['adventure-choice','adventure'],['citydate','citydate'],['rain','rain']])$(id).addEventListener('change',e=>{state[key]=e.target.value;render();toast('Our plan is updated on this device.')});
function jumpToDay(i){selectDay(i);$('itinerary').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('day-panel').focus({preventScroll:true})}
document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{let i=Number(b.dataset.day);if(days()[i].id==='city')i=days().findIndex((d,j)=>j>=4&&d.id!=='city');jumpToDay(i)});
const dialog = $('experience-dialog');
const galleryButtons = Array.from(document.querySelectorAll('.moments-grid [data-experience]'));
const photoStories = {
  everglades: {
    title: 'Everglades National Park', image: 'everglades',
    alt: 'Golden sunset reflected in the wetlands of Everglades National Park',
    description: 'At Shark Valley, we’ll look for alligators and wading birds along the 15-mile loop. We can ride the tram or rent bikes.'
  },
  airboat: {
    day: 'everglades', title: 'An airboat through the wetlands', image: 'airboat',
    alt: 'Passengers on an airboat in an Everglades channel',
    description: 'After Shark Valley, we’ll stop at Coopertown for an airboat ride through the wetlands.'
  },
  adventure: { ...base.snorkel, title: 'Snorkeling in Biscayne Bay' },
  transfer: { ...base.transfer, title: 'Vizcaya Museum & Gardens' },
  havana: {
    day: 'transfer', title: 'Little Havana', image: 'havana',
    alt: 'Domino Park in Little Havana',
    description: 'We’ll stop for Cuban lunch and walk along Calle Ocho before heading to South Beach.'
  },
  mid: { ...base.mid, title: 'Ocean Drive & Art Deco' },
  wynwood: {
    day: 'city', title: 'Street art in Wynwood', image: 'wynwood',
    alt: 'A colorful portrait mural in the Wynwood neighborhood',
    description: 'On a dry city day, we’ll see the neighborhood’s murals before heading to Frost Science.'
  },
  pier: {
    day: 'transfer', title: 'South Pointe Park', image: 'pier',
    alt: 'South Pointe Pier and Miami Beach seen from above',
    description: 'Our first evening on South Beach can start with a walk by the ocean and the inlet.'
  }
};
let galleryIndex = -1;
function showPhoto(key) {
  const data = days();
  const story = photoStories[key];
  const i = data.findIndex(day => day.id === (story?.day || key));
  if (i < 0) return;
  const day = { ...data[i], ...story };
  const photo = $('dialog-image');
  photo.src = 'assets/' + day.image + '.webp';
  photo.alt = day.alt;
  photo.dataset.image = day.image;
  $('dialog-date').textContent = dateLong(i);
  $('dialog-title').textContent = day.title;
  $('dialog-description').textContent = day.description;
  $('photo-pager').hidden = galleryIndex < 0;
  $('dialog-day').onclick = () => {
    returnFocus = null;
    document.body.style.overflow = '';
    dialog.close();
    jumpToDay(i);
  };
}
function movePhoto(step) {
  if (galleryIndex < 0) return;
  galleryIndex = (galleryIndex + step + galleryButtons.length) % galleryButtons.length;
  showPhoto(galleryButtons[galleryIndex].dataset.experience);
}
$('photo-prev').onclick = () => movePhoto(-1);
$('photo-next').onclick = () => movePhoto(1);
dialog.addEventListener('keydown', event => {
  if (galleryIndex < 0) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
document.querySelectorAll('[data-experience]').forEach(button => {
  button.onclick = () => {
    returnFocus = button;
    galleryIndex = galleryButtons.indexOf(button);
    showPhoto(button.dataset.experience);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  };
});
document.querySelector('.dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';if(returnFocus)returnFocus.focus({preventScroll:true})});
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500)}
async function share(day){const u=new URL(location.href);u.hash='';u.searchParams.delete('day');if(Number.isInteger(day))u.searchParams.set('day',String(day+1));for(const k of Object.keys(defaults))u.searchParams.set(k,state[k]);try{if(navigator.share){await navigator.share({title:'Our Miami escape',text:'A little wild. A little colorful. A whole lot of time together.',url:u.href})}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(u.href);toast('Trip link copied. Share the sunshine!')}else prompt('Copy our trip link:',u.href)}catch(e){if(e.name!=='AbortError'){try{await navigator.clipboard.writeText(u.href);toast('Trip link copied.')}catch{prompt('Copy our trip link:',u.href)}}}}
$('share').onclick = () => share();
$('share-bottom').onclick = () => share();

const stops = {
  airport: ['Miami International Airport', 25.7959, -80.2870],
  doral: ['CityPlace Doral', 25.8120, -80.3510],
  shark: ['Shark Valley Visitor Center', 25.7576, -80.7664],
  airboat: ['Coopertown Airboats', 25.7618, -80.5778],
  marina: ['Dinner Key Marina, Coconut Grove', 25.7270, -80.2330],
  zoo: ['Zoo Miami', 25.6106, -80.3977],
  vizcaya: ['Vizcaya Museum & Gardens', 25.7443, -80.2105],
  havana: ['Domino Park, Little Havana', 25.7653, -80.2190],
  pointe: ['South Pointe Park', 25.7660, -80.1340],
  mid: ['Miami Beach Boardwalk, Mid Beach', 25.8119, -80.1218],
  ocean: ['Ocean Drive, Art Deco District', 25.7810, -80.1305],
  beach: ['Lummus Park, South Beach', 25.7800, -80.1297],
  wynwood: ['Wynwood Walls', 25.8010, -80.1994],
  frost: ['Frost Science', 25.7853, -80.1880],
  bayside: ['Bayside Marketplace', 25.7785, -80.1867],
  garden: ['Miami Beach Botanical Garden', 25.7953, -80.1360],
  lincoln: ['Lincoln Road Mall', 25.7907, -80.1390],
  espanola: ['Española Way', 25.7864, -80.1326]
};
const dailyStops = {
  arrival: ['airport','doral'], everglades: ['shark','airboat'],
  transfer: ['vizcaya','havana','airport','pointe'], mid: ['mid','beach','ocean'],
  garden: ['garden','lincoln','beach','espanola'], departure: ['pointe','airport']
};
function stopsFor(day) {
  if (day.id === 'adventure') return state.adventure === 'zoo' ? ['zoo'] : ['marina'];
  if (day.id === 'city') return state.rain === 'wet' ? ['frost'] : ['wynwood','frost','bayside'];
  return dailyStops[day.id];
}

let tripMap, mapLayer;
let showAllStops = false;
let lastMapView = '';
function setupMap() {
  if (tripMap || !window.L || mediaMode !== 'map') return;
  tripMap = L.map('trip-map', { scrollWheelZoom: false, maxZoom: 17 });
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(tripMap);
  tiles.on('load', () => $('trip-map').classList.remove('tiles-unavailable'));
  tiles.on('tileerror', () => $('trip-map').classList.add('tiles-unavailable'));
  mapLayer = L.layerGroup().addTo(tripMap);
}
function renderStops() {
  const list = $('stop-list');
  const day = days()[selected];
  const activeKeys = stopsFor(day);
  const keys = showAllStops ? [...new Set(days().flatMap(stopsFor))] : activeKeys;
  $('map-day').textContent = showAllStops ? 'Whole trip' : dateShort(selected) + ' · ' + shortTitle(day);
  $('all-stops').textContent = showAllStops ? 'Back to this day' : 'Show all stops';
  $('all-stops').setAttribute('aria-pressed', String(showAllStops));
  setupMap();
  const canDraw = tripMap && mediaMode === 'map';
  if (canDraw) {
    tripMap.invalidateSize({pan: false});
    mapLayer.clearLayers();
  }
  list.replaceChildren();
  const points = [];
  keys.forEach((key, i) => {
    const [name, lat, lng] = stops[key];
    const label = i + 1;
    const item = document.createElement('li');
    const direction = document.createElement('a');
    direction.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(name + ', Florida');
    direction.target = '_blank';
    direction.rel = 'noopener';
    direction.textContent = 'Directions';
    direction.setAttribute('aria-label', 'Directions to ' + name);
    if (canDraw) {
      const color = selected < 4 && !showAllStops ? 'coral-pin' : 'teal-pin';
      const icon = L.divIcon({className: 'trip-pin ' + color, html: String(label), iconSize: [28,28]});
      const marker = L.marker([lat,lng], {title: name, alt: name, icon});
      marker.on('add', () => marker.getElement()?.setAttribute('aria-label', label + '. ' + name));
      marker.addTo(mapLayer);
      const popup = document.createElement('div');
      popup.textContent = name;
      popup.append(document.createElement('br'), direction.cloneNode(true));
      marker.bindPopup(popup, {autoPanPaddingTopLeft: [14, 72], autoPanPaddingBottomRight: [14, 62]});
      const locate = document.createElement('button');
      locate.type = 'button';
      locate.className = 'locate-stop';
      locate.textContent = name;
      locate.onclick = () => marker.openPopup();
      item.append(locate);
      points.push([lat,lng]);
    } else {
      item.append(document.createTextNode(name));
    }
    item.append(direction);
    list.append(item);
  });
  if (!canDraw) return;
  const view = keys.join(',');
  if (view !== lastMapView) {
    if (points.length === 1) tripMap.setView(points[0], 14, {animate: false});
    else tripMap.fitBounds(points, {padding: [32,32], maxZoom: 14, animate: false});
    lastMapView = view;
  }
}
$('all-stops').onclick = () => { showAllStops = !showAllStops; renderStops(); };

const bookingItems = [
  ['Shark Valley bikes or tram', base.everglades.links[0][1]],
  ['Biscayne snorkeling, if conditions suit', base.snorkel.links[0][1]],
  ['Vizcaya Museum & Gardens', base.transfer.links[0][1]],
  ['Wynwood Walls', 'https://thewynwoodwalls.com/admissions'],
  ['Frost Science', base.city.links[1][1]]
];
const packingItems = ['Swimsuits and towels', 'Sunscreen and sunglasses', 'Bug spray', 'Light jackets', 'Water bottles', 'Walking shoes'];
function checklist(id, items) {
  const storeKey = 'miami-escape-' + id;
  let checked = {};
  try { checked = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch {}
  for (const [name, url] of items) {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked[name] === true;
    input.onchange = () => {
      checked[name] = input.checked;
      try { localStorage.setItem(storeKey, JSON.stringify(checked)); } catch {}
    };
    label.append(input, document.createTextNode(name));
    item.append(label);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Visit site';
      a.setAttribute('aria-label', 'Visit booking site for ' + name);
      item.append(a);
    }
    $(id).append(item);
  }
}
checklist('booking-list', bookingItems);
checklist('packing-list', packingItems.map(item => [item]));
window.addEventListener('beforeprint', () => {
  $('print-plan').innerHTML = '<h1>Our Miami escape</h1><p>Dec 31, 2026 to Jan 7, 2027</p>' + days().map((day, i) =>
    `<article><h2>${dateLong(i)} · ${shortTitle(day)}</h2><ul>${day.plan.map(([time, activity]) =>
      `<li><b>${escapeHtml(time)}</b> ${escapeHtml(activity)}</li>`
    ).join('')}</ul>${day.note ? `<p>${escapeHtml(day.note)}</p>` : ''}</article>`
  ).join('');
});
$('print-trip').onclick = () => window.print();
document.querySelector('.nav-links a[href="#trip-details"]').onclick = () => {
  $('trip-details').querySelector('details').open = true;
};

const arrivalDate = '2026-12-31';
const tripEnd = '2027-01-07';
function miamiDate() {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
}
function daysBetween(first, second) {
  return Math.round((Date.parse(second) - Date.parse(first)) / 86400000);
}
const untilTrip = daysBetween(miamiDate(), arrivalDate);
if (untilTrip > 0) $('countdown').textContent = untilTrip + (untilTrip === 1 ? ' day to Miami' : ' days to Miami');

$('forecast-load').onclick = async () => {
  const button = $('forecast-load');
  const status = $('forecast-status');
  const output = $('forecast-days');
  output.replaceChildren();
  if (daysBetween(miamiDate(), arrivalDate) > 15) {
    status.textContent = 'Trip dates enter forecast range in mid-December. Check again closer to departure.';
    return;
  }
  if (miamiDate() > tripEnd) {
    status.textContent = 'The trip dates have passed.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Loading Miami Beach forecast…';
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.78&longitude=-80.13&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=16', {signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Forecast unavailable');
    const {daily} = await response.json();
    daily.time.forEach((date, i) => {
      if (date < arrivalDate || date > tripEnd) return;
      const values = [daily.temperature_2m_max[i], daily.precipitation_probability_max[i], daily.wind_speed_10m_max[i]];
      if (!values.every(Number.isFinite)) return;
      const card = document.createElement('div');
      const name = document.createElement('b');
      name.textContent = dateShort(daysBetween(arrivalDate, date));
      const details = document.createElement('p');
      details.textContent = `${Math.round(values[0])}°F high · ${Math.round(values[1])}% rain · ${Math.round(values[2])} mph wind`;
      card.append(name, details);
      output.append(card);
    });
    status.textContent = output.children.length
      ? 'Miami Beach daily outlook from Open-Meteo. Check marine conditions and ask the tour operator before snorkeling.'
      : 'Trip dates are outside the available forecast.';
  } catch {
    status.textContent = 'The forecast couldn’t load. Try again later or check the NWS link.';
  } finally {
    button.disabled = false;
  }
};

render();
if (requestedDay && /^[1-8]$/.test(requestedDay)) {
  requestAnimationFrame(() => jumpToDay(selected));
}
