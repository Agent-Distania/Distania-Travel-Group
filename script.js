// =======================
// DOM
// =======================
const startupScreen  = document.getElementById('startupScreen');
const loginScreen    = document.getElementById('loginScreen');
const travelScreen   = document.getElementById('travelScreen');
const destList       = document.querySelector('.dest-list');
const logEl          = document.getElementById('log');
const travelOverlay  = document.getElementById('travelOverlay');

// =======================
// State
// =======================
let traveling         = false;
let currentLocation   = null; // key of the specific place we're at
let currentHub        = null; // key of the top-level destination (Earth, Mars…)
let currentSubLocation= null; // parent key when at level-3 depth
let ambientTimer      = null;
let ambientFirstTimer = null;

const AMBIENT_INTERVAL = 30000;

// Shuffle queues per location so NPCs don't repeat back-to-back
const ambientQueues = {};

// Journal: stores notable NPC lines the player has "heard"
const journal = [];

// Data containers
const mainDestinations  = [];
const destinationConfigs = {};
const ambientDialogue    = {};

// Load flags to avoid race conditions
let destinationsReady = false;
let dialogueReady     = false;
let pendingStart      = false; // true if ON was pressed before data finished loading

// =======================
// Data Loading
// =======================
function onDataReady() {
  if (!destinationsReady || !dialogueReady) return; // wait for both
  if (pendingStart) {
    pendingStart = false;
    startTravelConsole();
  }
}

fetch('destinations.json')
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    mainDestinations.push(...data.mainDestinations);
    Object.assign(destinationConfigs, data.destinationConfigs);
    destinationsReady = true;
    onDataReady();
  })
  .catch(err => {
    console.error('destinations.json failed:', err);
    loadFallbackDestinations();
    destinationsReady = true;
    onDataReady();
  });

// Load both dialogue files in parallel
Promise.all([
  fetch('novaDialogue.json').then(r => r.json()),
  fetch('ambientDialogue.json').then(r => r.json())
]).then(([nova, ambient]) => {
  NovaAI.dialogue = nova;
  Object.assign(ambientDialogue, ambient);
  dialogueReady = true;
  onDataReady();
}).catch(err => {
  console.error('Dialogue load failed:', err);
  appendLog('System: Communication array partially offline.');
  dialogueReady = true; // continue without dialogue rather than hanging
  onDataReady();
});

// =======================
// Fallback Destinations
// =======================
function loadFallbackDestinations() {
  appendLog('System: Navigation data unavailable — loading emergency backup.');
  const fallback = {
    mainDestinations: [
      { name: 'Earth',                  key: 'Earth' },
      { name: 'Mars Colony Alpha',      key: 'Mars' },
      { name: 'Jupiter Orbital Station',key: 'Jupiter' },
      { name: 'Europa Research Base',   key: 'Europa' },
      { name: 'Andromeda Outpost',      key: 'Andromeda' },
      { name: 'Vega Prime',             key: 'Vega' }
    ],
    destinationConfigs: {
      Earth: {
        description: 'Orbiting Earth, the fractured home of humanity.',
        travelType: 'train',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'New York Sector', key: 'NewYork', description: 'Rebuilt city after the Kilko disaster.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Downtown Core',        key: 'NewYork_Downtown',  description: 'The center of rebuilt New York.' },
              { name: 'Torta Excavation Site',key: 'NewYork_Torta',     description: 'Ongoing megastructure digs.' },
              { name: 'Skyline Transit Nexus',key: 'NewYork_Transit',   description: 'Floating vertical transit station.' }
            ]
          },
          { name: 'Earth Space Port', key: 'EarthSpacePort', description: 'Cargo and civilian port.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Processing',   key: 'EarthSpacePort_FrontDesk', description: 'Civilian and cargo inspection.' },
              { name: 'Cargo Intake', key: 'EarthSpacePort_Cargo',     description: 'Freight unloading zone.' },
              { name: 'Docking Bay',  key: 'EarthSpacePort_Docking',   description: 'Refueling and boarding.' }
            ]
          },
          { name: 'Pacific Research Facility', key: 'Pacific', description: 'Floating research base on deep-sea anomalies.',
            subDestinations: [
              { name: 'Return to Previous',  key: 'Return' },
              { name: 'Kilko Artifact Lab',  key: 'Pacific_ArtifactLab', description: 'Kilko debris containment.' },
              { name: 'Deep Sea Observatory',key: 'Pacific_Observatory',  description: 'Submersible monitoring station.' },
              { name: 'Abyssal Research Wing',key:'Pacific_Abyssal',      description: 'Pressurized deep trench labs.' }
            ]
          }
        ]
      },
      Mars: {
        description: 'Orbiting Mars Colony Alpha.',
        travelType: 'shuttle',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'Colony Core', key: 'ColonyCore', description: 'Heart of Martian habitation.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Residential Dome', key: 'ColonyCore_Residential', description: 'Colonist living quarters.' },
              { name: 'Central Market',   key: 'ColonyCore_Market',      description: 'Bustling commercial hub.' },
              { name: 'Power Hub',        key: 'ColonyCore_Power',       description: 'Life support power station.' }
            ]
          },
          { name: 'Terraforming Fields', key: 'TerraformingFields', description: 'Atmosphere processors.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Ancient Vault', key: 'AncientVault', description: 'Pre-human vault.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          }
        ]
      },
      Jupiter: {
        description: 'Orbiting Jupiter Orbital Station.',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'Storm Observatory', key: 'StormObservatory', description: 'Monitors Jupiter storms.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Sensor Array',    key: 'StormObservatory_Sensors', description: 'EM field measurement.' },
              { name: 'Atmospheric Lab', key: 'StormObservatory_Lab',     description: 'Weather research.' }
            ]
          },
          { name: 'Gas Harvesting Platform', key: 'GasHarvester', description: 'Fuel gas siphoning.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Research Array',   key: 'ResearchArray',      description: 'Drone sensor network.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Deep Core Relay',  key: 'CoreRelay',          description: 'Deep atmosphere comms hub.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Excavation Platforms', key: 'ExcavationPlatforms', description: 'Ring structure excavation.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          }
        ]
      },
      Europa: {
        description: 'Orbiting Europa Research Base.',
        travelType: 'rover',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'Research Base', key: 'ResearchBase', description: 'Core Europa research station.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Subsurface Tunnels', key: 'ResearchBase_Tunnels', description: 'Ice tunnels beneath the surface.' },
              { name: 'AI Lab',             key: 'ResearchBase_Lab',     description: 'AI behavior research.' },
              { name: 'Core Chamber',       key: 'ResearchBase_Core',    description: 'Flooded megastructure cavern.' }
            ]
          },
          { name: 'Ground Camp', key: 'GroundCamp', description: 'Field drilling base.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Ruins', key: 'Ruins', description: 'Ancient megastructure under ice.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          }
        ]
      },
      Andromeda: {
        description: 'Orbiting Andromeda Outpost.',
        travelType: 'shuttle',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'Forward Recon Station', key: 'ForwardRecon', description: 'Deep-space threat monitoring.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Black Spire Relay',     key: 'BlackSpire',   description: 'Quantum signal relay.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Xeno Archives',         key: 'XenoArchives', description: 'Alien artifact vault.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Statue Research Wing',  key: 'StatueWing',   description: 'Chamber of alien statues.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          }
        ]
      },
      Vega: {
        description: 'Orbiting Vega Prime.',
        subDestinations: [
          { name: 'Return to Ship', key: 'Return' },
          { name: 'Capital City', key: 'CapitalCity', description: 'Neon metropolis.',
            subDestinations: [
              { name: 'Return to Previous', key: 'Return' },
              { name: 'Tech District',   key: 'CapitalCity_Tech',   description: 'AI and startup hub.' },
              { name: 'Underdeck Market',key: 'CapitalCity_Market', description: 'Black market for rare parts.' },
              { name: 'Central Core',    key: 'CapitalCity_Core',   description: 'City processors and grid.' }
            ]
          },
          { name: 'Orbital Trade Ring',       key: 'OrbitalTradeRing',       description: 'Trade and piracy ring.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Stellar Observation Spire',key: 'StellarObservationSpire', description: 'First to spot megastructures.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          },
          { name: 'Crystal Canyon Outpost',   key: 'CrystalCanyonOutpost',    description: 'Gem mines with alien tech.',
            subDestinations: [{ name: 'Return to Previous', key: 'Return' }]
          }
        ]
      }
    }
  };
  mainDestinations.push(...fallback.mainDestinations);
  Object.assign(destinationConfigs, fallback.destinationConfigs);
}

// =======================
// Save / Restore State
// =======================
function saveState() {
  try {
    localStorage.setItem('distania_state', JSON.stringify({
      currentLocation,
      currentHub,
      currentSubLocation
    }));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('distania_state');
    if (!raw) return false;
    const { currentLocation: loc, currentHub: hub, currentSubLocation: sub } = JSON.parse(raw);
    if (!hub || !destinationConfigs[hub]) return false;
    currentLocation    = loc;
    currentHub         = hub;
    currentSubLocation = sub;
    return true;
  } catch (_) {
    return false;
  }
}

function clearSavedState() {
  try { localStorage.removeItem('distania_state'); } catch (_) {}
}

// =======================
// Log
// =======================
function appendLog(text) {
  const line = document.createElement('div');
  line.textContent = text.trim();
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// =======================
// Nova AI
// =======================
const NovaAI = {
  dialogue: {},
  idleTimer: null,

  speak(category) {
    const lines = this.dialogue[category];
    if (!lines?.length) return;
    appendLog(lines[Math.floor(Math.random() * lines.length)]);
  },

  // Speak a location-specific arrival line if one exists
  speakLocation(key) {
    const line = this.dialogue.locationArrivals?.[key];
    if (line) appendLog(line);
  },

  startIdle() {
    clearInterval(this.idleTimer);
    this.idleTimer = setInterval(() => {
      if (!traveling && Math.random() < 0.6) this.speak('idle');
    }, 45000);
  },

  stopIdle() { clearInterval(this.idleTimer); }
};

// =======================
// Journal
// =======================
function addToJournal(speaker, line, location) {
  journal.push({ speaker, line, location, time: new Date().toLocaleTimeString() });
}

function renderJournal() {
  const overlay = document.getElementById('missionLogOverlay');
  const list    = document.getElementById('journalEntries');
  list.innerHTML = '';
  if (journal.length === 0) {
    list.innerHTML = '<div class="log-entry">No entries yet. Explore and listen.</div>';
  } else {
    [...journal].reverse().forEach(({ speaker, line, location, time }) => {
      const el = document.createElement('div');
      el.className = 'log-entry';
      el.textContent = `[${time}] ${location} — ${speaker}: "${line}"`;
      list.appendChild(el);
    });
  }
  overlay.classList.remove('hidden');
}

// =======================
// Ambient Dialogue (shuffle queue)
// =======================
function getShuffledQueue(key) {
  const messages = ambientDialogue[key];
  if (!messages?.length) return [];
  // Fisher-Yates shuffle
  const arr = [...messages];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextAmbientMessage(key) {
  if (!ambientQueues[key] || ambientQueues[key].length === 0) {
    ambientQueues[key] = getShuffledQueue(key);
  }
  return ambientQueues[key].pop();
}

function startAmbientDialogue(key) {
  clearAmbientTimers();
  if (!ambientDialogue[key]?.length) return;

  ambientFirstTimer = setTimeout(() => {
    if (currentLocation !== key) return;
    fireAmbientLine(key);
  }, 8000);

  ambientTimer = setInterval(() => {
    if (currentLocation !== key) { clearAmbientTimers(); return; }
    fireAmbientLine(key);
  }, AMBIENT_INTERVAL);
}

function fireAmbientLine(key) {
  const msg = nextAmbientMessage(key);
  if (!msg) return;
  appendLog(`${msg.speaker}: "${msg.line}"`);
  addToJournal(msg.speaker, msg.line, key);
}

function clearAmbientTimers() {
  clearTimeout(ambientFirstTimer);
  clearInterval(ambientTimer);
  ambientFirstTimer = null;
  ambientTimer      = null;
}

// =======================
// Button Helpers
// =======================
function clearDestinations() {
  destList.innerHTML = '<h2>Select Destination</h2>';
}

function enableButtons() {
  destList.querySelectorAll('button').forEach(b => (b.disabled = false));
}

function createButtons(destinations) {
  clearDestinations();
  destinations.forEach(dest => {
    const btn = document.createElement('button');
    btn.textContent  = dest.name;
    btn.dataset.dest = dest.key;
    destList.appendChild(btn);
    btn.addEventListener('click', () => handleDestinationClick(dest, btn));
  });
}

// =======================
// Navigation Helpers
// =======================
function findByKey(key, list) {
  if (!list) return null;
  for (const item of list) {
    if (item.key === key) return item;
    const found = findByKey(key, item.subDestinations);
    if (found) return found;
  }
  return null;
}

function defaultSubs(dest) {
  return [
    { name: 'Return to Previous',        key: 'Return' },
    { name: `${dest.name} Core Zone`,    key: `${dest.key}_1` },
    { name: `${dest.name} Outer Sector`, key: `${dest.key}_2` }
  ];
}

// =======================
// Click Handler
// =======================
function handleDestinationClick(dest, btn) {
  if (traveling) return;

  if (dest.key === 'Return') { handleReturn(); return; }

  const isMain = mainDestinations.some(d => d.key === dest.key);

  if (isMain && !currentHub) { travelMain(dest, btn); return; }

  if (currentHub) {
    const config = destinationConfigs[currentHub];
    const isDirectSub = config.subDestinations?.some(d => d.key === dest.key);
    if (isDirectSub) { travelSub(dest, btn, config); return; }

    if (currentLocation) {
      const parent = findByKey(currentLocation, config.subDestinations);
      if (parent?.subDestinations?.some(d => d.key === dest.key)) {
        travelSubSub(dest, btn, parent); return;
      }
    }
  }
}

// =======================
// Return Logic
// =======================
function handleReturn() {
  clearAmbientTimers();
  NovaAI.stopIdle();

  // Level 3 -> level 2
  if (currentSubLocation) {
    const config = destinationConfigs[currentHub];
    const parent = findByKey(currentSubLocation, config.subDestinations);
    if (parent?.subDestinations) {
      appendLog(`System: Returning to ${parent.name}.`);
      currentLocation    = currentSubLocation;
      currentSubLocation = null;
      createButtons(parent.subDestinations);
      startAmbientDialogue(currentLocation);
      NovaAI.startIdle();
      saveState();
      return;
    }
  }

  // Level 2 -> hub list
  if (currentLocation && currentLocation !== currentHub) {
    const config = destinationConfigs[currentHub];
    appendLog(`System: Returning to ${currentHub} sectors.`);
    currentLocation    = currentHub;
    currentSubLocation = null;
    createButtons(config.subDestinations);
    NovaAI.startIdle();
    saveState();
    return;
  }

  // Hub -> ship
  appendLog('System: Returning to ship. Please select a destination.');
  currentLocation    = null;
  currentHub         = null;
  currentSubLocation = null;
  clearSavedState();
  createButtons(mainDestinations);
}

// =======================
// Travel Helpers
// =======================
function beginTravel(btn) {
  traveling = true;
  clearAmbientTimers();
  NovaAI.stopIdle();
  destList.querySelectorAll('button').forEach(b => {
    b.disabled = false; // re-enable first so selected styling applies cleanly
    b.classList.remove('selected');
    b.disabled = true;
  });
  if (btn) btn.classList.add('selected');
}

function endTravel(loc, hub, sub = null) {
  currentLocation    = loc;
  currentHub         = hub;
  currentSubLocation = sub;
  traveling          = false;
  enableButtons();
  saveState();
}

function showOverlay(msg = 'Engaging transit...') {
  travelOverlay.textContent = msg;
  travelOverlay.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() =>
    travelOverlay.classList.add('active')
  ));
}

function hideOverlay() {
  travelOverlay.classList.remove('active');
  setTimeout(() => travelOverlay.classList.add('hidden'), 800);
}

// =======================
// Travel Functions
// =======================
function travelMain(dest, btn) {
  beginTravel(btn);
  NovaAI.speak('travel');
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  showOverlay(`Engaging transit to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Zero-point travel complete. Welcome to ${dest.name}.`);
    NovaAI.speak('arrival');
    NovaAI.speakLocation(dest.key);

    const config = destinationConfigs[dest.key];
    if (config?.description) appendLog(config.description);

    endTravel(dest.key, dest.key, null);
    createButtons(config.subDestinations);
    NovaAI.startIdle();
  }, 3000);
}

function travelSub(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak('travel');

  const travelType = dest.travelType || config.travelType || 'shuttle';
  const labels = {
    drone: 'Deploying drone', orbit: 'Initiating orbital alignment',
    rover: 'Boarding the rover', shuttle: 'Boarding the shuttle', train: 'Boarding the train'
  };
  const label = labels[travelType] || 'Traveling';

  appendLog(`System: ${label} to ${dest.name}...`);
  showOverlay(`${label} to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Arrived at ${dest.name}.`);
    if (dest.description) appendLog(dest.description);
    NovaAI.speak('arrival');
    NovaAI.speakLocation(dest.key);

    if (!dest.subDestinations) dest.subDestinations = defaultSubs(dest);
    endTravel(dest.key, currentHub, null);
    createButtons(dest.subDestinations);
    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
  }, travelType === 'drone' ? 2000 : 3000);
}

function travelSubSub(dest, btn, parentDest) {
  beginTravel(btn);
  NovaAI.speak('travel');
  appendLog(`System: Traveling deeper to ${dest.name}...`);
  showOverlay(`Traveling deeper to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Arrived at ${dest.name}.`);
    if (dest.description) appendLog(dest.description);
    NovaAI.speak('arrival');
    NovaAI.speakLocation(dest.key);

    if (!dest.subDestinations) dest.subDestinations = defaultSubs(dest);
    endTravel(dest.key, currentHub, parentDest.key);
    createButtons(dest.subDestinations);
    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
  }, 2000);
}

// =======================
// Restore from saved state
// =======================
function restoreSession() {
  if (!loadState()) {
    appendLog('System: Welcome, Captain. Please select a destination.');
    createButtons(mainDestinations);
    return;
  }

  appendLog(`System: Session restored. Last known location: ${currentLocation}.`);
  NovaAI.speakLocation(currentLocation);

  // Rebuild the button list appropriate for where we were
  if (currentSubLocation) {
    // Level 3 — show parent sub-destination buttons
    const config = destinationConfigs[currentHub];
    const parent = findByKey(currentSubLocation, config.subDestinations);
    if (parent?.subDestinations) {
      createButtons(parent.subDestinations);
      startAmbientDialogue(currentLocation);
      NovaAI.startIdle();
      return;
    }
  }

  if (currentLocation && currentLocation !== currentHub) {
    // Level 2 — show sub-destination buttons
    const config = destinationConfigs[currentHub];
    const dest   = findByKey(currentLocation, config.subDestinations);
    if (dest?.subDestinations) {
      createButtons(dest.subDestinations);
      startAmbientDialogue(currentLocation);
      NovaAI.startIdle();
      return;
    }
  }

  // Hub level — show hub sub-destinations
  const config = destinationConfigs[currentHub];
  createButtons(config.subDestinations);
  NovaAI.startIdle();
}

// Called once both JSON files are loaded and ON has been pressed
function startTravelConsole() {
  document.getElementById('journalToggle').style.display = 'block';
  restoreSession();
}

// =======================
// Event Handlers
// =======================
window.addEventListener('DOMContentLoaded', () => {
  const proceedBtn      = document.getElementById('proceedBtn');
  const onBtn           = document.getElementById('onBtn');
  const journalToggle   = document.getElementById('journalToggle');
  const closeJournal    = document.getElementById('closeJournal');

  proceedBtn?.addEventListener('click', e => {
    e.preventDefault();
    startupScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  });

  onBtn?.addEventListener('click', e => {
    e.preventDefault();
    loginScreen.classList.add('hidden');
    travelScreen.classList.remove('hidden');

    if (destinationsReady && dialogueReady) {
      startTravelConsole();
    } else {
      appendLog('System: Loading navigation data...');
      pendingStart = true;
    }
  });

  journalToggle?.addEventListener('click', () => renderJournal());
  closeJournal?.addEventListener('click', () => {
    document.getElementById('missionLogOverlay').classList.add('hidden');
  });
});
