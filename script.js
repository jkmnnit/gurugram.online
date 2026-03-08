// ── WEATHER FETCH (Open-Meteo — Gurugram coords) ──
const LAT = 28.4595;
const LON = 77.0266;

const WMO_CODES = {
  0:'Clear Sky', 1:'Mainly Clear', 2:'Partly Cloudy', 3:'Overcast',
  45:'Foggy', 48:'Icy Fog', 51:'Light Drizzle', 53:'Drizzle', 55:'Heavy Drizzle',
  61:'Light Rain', 63:'Moderate Rain', 65:'Heavy Rain',
  71:'Light Snow', 73:'Moderate Snow', 75:'Heavy Snow',
  80:'Light Showers', 81:'Showers', 82:'Heavy Showers',
  95:'Thunderstorm', 96:'Thunderstorm + Hail', 99:'Heavy Thunderstorm'
};
const WMO_EMOJI = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️', 61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'🌨️', 73:'🌨️', 75:'❄️', 80:'🌦️', 81:'🌧️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️'
};
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

async function loadWeather() {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=14`);
    const d = await res.json();
    const c = d.current;
    document.getElementById('wtemp').textContent = Math.round(c.temperature_2m);
    document.getElementById('wdesc').textContent = WMO_CODES[c.weather_code] || 'Clear';
    document.getElementById('wfeels').textContent = `Feels like ${Math.round(c.apparent_temperature)}°C`;
    document.getElementById('wemoji').textContent = WMO_EMOJI[c.weather_code] || '🌤️';
    document.getElementById('whumidity').textContent = c.relative_humidity_2m + '%';
    document.getElementById('wwind').textContent = Math.round(c.wind_speed_10m) + ' km/h';
    document.getElementById('wprecip').textContent = c.precipitation + ' mm';
    // Forecast
    const fg = document.getElementById('forecast-grid');
    fg.innerHTML = d.daily.time.slice(0,7).map((t,i) => {
      const date = new Date(t);
      const dayName = i === 0 ? 'Today' : DAYS[date.getDay()];
      const code = d.daily.weather_code[i];
      return `<div class="forecast-day">
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-day-icon">${WMO_EMOJI[code] || '🌤️'}</div>
        <div class="forecast-day-max">${Math.round(d.daily.temperature_2m_max[i])}°</div>
        <div class="forecast-day-min" style="color:var(--text3)">${Math.round(d.daily.temperature_2m_min[i])}°</div>
      </div>`;
    }).join('');
  } catch(e) { console.error('Weather error:', e); }
}

async function loadAQI() {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=us_aqi,pm2_5,pm10,european_aqi&timezone=Asia%2FKolkata`);
    const d = await res.json();
    const aqi = d.current.us_aqi;
    let label, cls, desc;
    if (aqi <= 50) { label='Good'; cls='aqi-good'; desc='Air quality is satisfactory.'; }
    else if (aqi <= 100) { label='Moderate'; cls='aqi-moderate'; desc='Acceptable air quality for most people.'; }
    else if (aqi <= 150) { label='Unhealthy for Sensitive Groups'; cls='aqi-moderate'; desc='Sensitive groups should limit outdoor exposure.'; }
    else if (aqi <= 200) { label='Unhealthy'; cls='aqi-hazardous'; desc='Everyone may begin to experience effects.'; }
    else if (aqi <= 300) { label='Very Unhealthy'; cls='aqi-hazardous'; desc='Health alert — limit outdoor activity.'; }
    else { label='Hazardous'; cls='aqi-hazardous'; desc='Emergency conditions — stay indoors.'; }
    const el = document.getElementById('aqi-val');
    el.textContent = aqi;
    el.className = 'aqi-value ' + cls;
    document.getElementById('aqi-label').textContent = label;
    document.getElementById('aqi-desc').textContent = desc;
    document.getElementById('aqi-pm25').textContent = d.current.pm2_5?.toFixed(1) || '--';
    document.getElementById('aqi-pm10').textContent = d.current.pm10?.toFixed(1) || '--';
  } catch(e) { console.error('AQI error:', e); }
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── NAV ACTIVE LINK ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ── EVENT FILTER BUTTONS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── CLICKABLE CARDS WITH LOCATION LINKS ──
document.querySelectorAll('.card, .img-card, .institution-card, .event-detail-card').forEach(card => {
  const locationLink = card.querySelector('.location-link');
  if (locationLink) {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on a button or link directly
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        locationLink.click();
      }
    });
  }
});

// ── CLICKABLE FEATURED EVENT IMAGE ──
document.querySelectorAll('.event-featured').forEach(featured => {
  const imgCard = featured.querySelector('.event-img-card');
  const detailCard = featured.querySelector('.event-detail-card');
  const locationLink = detailCard?.querySelector('.location-link');
  
  if (imgCard && locationLink) {
    imgCard.addEventListener('click', (e) => {
      locationLink.click();
    });
  }
});

// ── SEARCH FUNCTIONALITY ──
let searchTimeout;
const searchInput = document.querySelector('.hero-search');
const searchClear = document.querySelector('.hero-search-clear');
const allSections = document.querySelectorAll('section, [id]');
const heroSection = document.querySelector('.hero');
const footer = document.querySelector('footer');

function performSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  
  // Show/hide clear button
  searchClear.style.display = searchTerm ? 'block' : 'none';
  
  if (searchTerm === '') {
    // Show all sections when search is empty
    allSections.forEach(section => {
      if (section !== heroSection && section !== footer) {
        section.style.display = 'block';
      }
    });
    // Reset nearme cards visibility
    document.querySelectorAll('.nearme-card').forEach(c => c.classList.remove('nm-hidden'));
    // Remove any highlighting
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.outerHTML = el.innerHTML;
    });
    return;
  }

  let hasResults = false;
  
  allSections.forEach(section => {
    if (section === heroSection || section === footer) return;

    const sectionContent = section.textContent.toLowerCase();
    const sectionElement = section;

    // Also check data-keywords on nearme cards inside this section
    const nearmeKeywords = Array.from(section.querySelectorAll('[data-keywords]'))
      .map(el => el.dataset.keywords).join(' ').toLowerCase();

    if (sectionContent.includes(searchTerm) || nearmeKeywords.includes(searchTerm)) {
      sectionElement.style.display = 'block';
      hasResults = true;

      // For nearme section: filter individual cards
      if (sectionElement.id === 'nearme') {
        let anyCardMatch = false;
        section.querySelectorAll('.nearme-card').forEach(card => {
          const cardText = (card.textContent + ' ' + (card.dataset.keywords || '')).toLowerCase();
          if (cardText.includes(searchTerm)) {
            card.classList.remove('nm-hidden');
            anyCardMatch = true;
          } else {
            card.classList.add('nm-hidden');
          }
        });
        if (!anyCardMatch) sectionElement.style.display = 'none';
      }

      // Highlight search terms in this section
      highlightSearchTerms(sectionElement, searchTerm);
    } else {
      sectionElement.style.display = 'none';
    }
  });

  // If no results, show a message
  if (!hasResults) {
    // Create a no results message
    if (!document.querySelector('.no-results')) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text2);">
          <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">No results found for "${query}"</div>
          <div style="font-size: 14px; opacity: 0.7;">Try searching for restaurants, hospitals, malls, metro stations, or events</div>
        </div>
      `;
      document.body.appendChild(noResults);
    }
  } else {
    // Remove no results message if it exists
    const noResults = document.querySelector('.no-results');
    if (noResults) noResults.remove();
  }
}

function highlightSearchTerms(element, searchTerm) {
  // Remove existing highlights first
  element.querySelectorAll('.search-highlight').forEach(el => {
    el.outerHTML = el.innerHTML;
  });

  // Find and highlight text nodes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.toLowerCase().includes(searchTerm)) {
      nodes.push(node);
    }
  }

  nodes.forEach(textNode => {
    const text = textNode.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
    const span = document.createElement('span');
    span.innerHTML = highlighted;
    textNode.parentNode.replaceChild(span, textNode);
  });
}

// Search input event listener with debounce
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(e.target.value);
  }, 300);
});

// Clear search on Escape key
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    performSearch('');
    searchInput.blur();
  }
});

// Clear search button
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  performSearch('');
  searchInput.focus();
});

// ── NEAR ME DYNAMIC GEOLOCATION ──
let userLat = null, userLng = null;
let locationRequested = false;
// Replace hardcoded 'near Gurugram' hrefs with 'near me' on load
updateNearMeCards();
const locateBtn = document.getElementById('nearme-locate-btn');
const locationText = document.getElementById('nearme-location-text');
const locationBar = document.getElementById('nearme-location-bar');
const locationIcon = document.getElementById('nearme-location-icon');

function getNearMeUrl(query) {
  if (userLat && userLng) {
    // Use exact coords — works regardless of city (Noida, Gurgaon, Delhi, etc.)
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLat},${userLng},16z`;
  }
  // Fallback: let Google Maps use its own location detection
  return `https://www.google.com/maps/search/${encodeURIComponent(query + ' near me')}`;
}

function updateNearMeCards() {
  document.querySelectorAll('.nearme-card[data-query]').forEach(card => {
    card.href = getNearMeUrl(card.dataset.query);
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    return addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.county || null;
  } catch { return null; }
}

function activateLocation(lat, lng) {
  userLat = parseFloat(lat).toFixed(6);
  userLng = parseFloat(lng).toFixed(6);
  updateNearMeCards();
  locationBar.classList.add('location-active');
  locationIcon.textContent = '🟢';
  locateBtn.textContent = '✅ Location Active';
  locateBtn.classList.add('active');
  locateBtn.disabled = false;
}

function requestLocation() {
  if (locationRequested) return;
  locationRequested = true;

  if (!navigator.geolocation) {
    locationText.textContent = '❌ Geolocation not supported by your browser';
    return;
  }
  locationText.textContent = '📡 Detecting your exact location…';
  locateBtn.disabled = true;
  locateBtn.textContent = '⏳ Locating…';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      activateLocation(pos.coords.latitude, pos.coords.longitude);
      // Show area name via reverse geocoding
      const areaName = await reverseGeocode(userLat, userLng);
      if (areaName) {
        locationText.innerHTML = `Showing results near <strong style="color:var(--accent2)">${areaName}</strong> — cards open Google Maps at your exact location`;
      } else {
        locationText.innerHTML = `📍 Showing results near your exact location — click any card to open Google Maps`;
      }
    },
    () => {
      locationRequested = false; // allow retry
      locationText.textContent = '⚠️ Location denied — click "Use My Location" to find services near you (works anywhere — Noida, Delhi, Gurgaon…)';
      locateBtn.textContent = '🎯 Use My Location';
      locateBtn.disabled = false;
    },
    { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
  );
}

// Button click
if (locateBtn) {
  locateBtn.addEventListener('click', () => {
    locationRequested = false; // reset so it can re-request
    requestLocation();
  });
}

// Auto-request when Near Me section scrolls into view (once)
const nearmeSection = document.getElementById('nearme');
if (nearmeSection && 'IntersectionObserver' in window) {
  const nearmeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !locationRequested) {
        requestLocation();
        nearmeObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });
  nearmeObserver.observe(nearmeSection);
}


// ── WEATHER & AQI INIT ──
loadWeather();
loadAQI();
