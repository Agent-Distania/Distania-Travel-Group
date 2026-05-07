// ================================================================
// DOM
// ================================================================
const startupScreen     = document.getElementById('startupScreen');
const loginScreen       = document.getElementById('loginScreen');
const travelScreen      = document.getElementById('travelScreen');
const destList          = document.querySelector('.dest-list');
const logEl             = document.getElementById('log');
const travelOverlay     = document.getElementById('travelOverlay');
const missionIndicator  = document.getElementById('missionIndicator');
const journalToggle     = document.getElementById('journalToggle');
const missionLogOverlay = document.getElementById('missionLogOverlay');

// ================================================================
// State
// ================================================================
let traveling         = false;
let currentLocation   = null;
let currentHub        = null;
let currentSubLocation= null;
let ambientTimer      = null;
let ambientFirstTimer = null;
const AMBIENT_INTERVAL = 28000;

// Shuffle queues so NPCs don't repeat back-to-back
const ambientQueues = {};

// Data containers
const mainDestinations   = [];
const destinationConfigs = {};
const ambientDialogue    = {};

// Load flags
let destinationsReady = false;
let dialogueReady     = false;
let pendingStart      = false;

// ================================================================
// Nova relationship (affects idle line pool)
// ================================================================
const novaRel = { visits: 0, completions: 0 };

// ================================================================
// Missions
// ================================================================
const MISSIONS = [
  {
    id: 'mission_01',
    title: 'First Contact Protocol',
    desc: 'ECS Command wants a field report from the Torta Excavation Site beneath New York.',
    target: 'NewYork_Torta',
    reward: 'Access to classified excavation frequency logs.',
    rewardKey: 'TORTA_LOGS',
    complete: false
  },
  {
    id: 'mission_02',
    title: 'Deep Signal',
    desc: 'Unconfirmed transmissions from the Pacific Abyssal Wing. Investigate and confirm.',
    target: 'Pacific_Abyssal',
    reward: 'Deep sea organism specimen — Specimen 7-C.',
    rewardKey: 'SPECIMEN_7C',
    complete: false
  },
  {
    id: 'mission_03',
    title: 'Vault Reconnaissance',
    desc: 'The Ancient Vault on Mars has gone dark. Establish contact with the research team.',
    target: 'AncientVault',
    reward: 'Pre-human inscription rubbing — Fragment Alpha.',
    rewardKey: 'VAULT_FRAGMENT',
    complete: false
  },
  {
    id: 'mission_04',
    title: 'Storm Analysis',
    desc: 'The Jupiter Storm Observatory Sensor Array is reporting anomalous pattern data.',
    target: 'StormObservatory_Sensors',
    reward: 'Storm pattern data core — Cycle 44.',
    rewardKey: 'STORM_DATA',
    complete: false
  },
  {
    id: 'mission_05',
    title: 'Shifting Tunnels',
    desc: 'Europa subsurface tunnel maps no longer match field observations. Survey the tunnels.',
    target: 'ResearchBase_Tunnels',
    reward: 'Ice core sample — Sector 7 deep layer.',
    rewardKey: 'ICE_CORE',
    complete: false
  },
  {
    id: 'mission_06',
    title: 'Archive Integrity',
    desc: 'Language AIs in the Xeno Archives are behaving erratically. Assess the situation.',
    target: 'XenoArchives',
    reward: 'Partial xenolinguistic index — Volume III.',
    rewardKey: 'XENO_INDEX',
    complete: false
  },
  {
    id: 'mission_07',
    title: 'Resonance Study',
    desc: 'Crystal Canyon Outpost reports unusual amplification of ECS signals. Verify on site.',
    target: 'CrystalCanyonOutpost',
    reward: 'Resonant crystal shard — Grade A.',
    rewardKey: 'CRYSTAL_SHARD',
    complete: false
  }
];

// ================================================================
// Collectibles — one hidden item per key location
// ================================================================
const COLLECTIBLES = [
  { id: 'col_01', name: 'Kilko Fragment — Node 7', desc: 'Still warm to the touch. Radiation minimal.', location: 'Pacific_ArtifactLab',         found: false },
  { id: 'col_02', name: 'Encrypted Data Core',     desc: 'Origin: unknown. Format: unreadable.',        location: 'ResearchBase_Lab',             found: false },
  { id: 'col_03', name: 'Obsidian Statue Shard',   desc: 'Edges are too perfect. Not carved — grown.',  location: 'StatueWing',                   found: false },
  { id: 'col_04', name: 'Void Berry Sample',        desc: 'Technically not legal yet. Smells incredible.', location: 'EarthSpacePort_FrontDesk',  found: false },
  { id: 'col_05', name: 'Torta Wall Rubbing',       desc: 'Symbols shift between viewings.',             location: 'NewYork_Torta',                found: false },
  { id: 'col_06', name: 'Abyssal Organism — Jar',  desc: 'Still glowing. Still moving.',                location: 'Pacific_Abyssal',              found: false },
  { id: 'col_07', name: 'Storm Data Wafer',         desc: 'The pattern stored here repeats every 88 seconds.', location: 'StormObservatory_Sensors', found: false },
  { id: 'col_08', name: 'Vault Inscription Photo',  desc: 'Camera corrupted on upload. Image survived.', location: 'AncientVault',                 found: false },
  { id: 'col_09', name: 'Crystal Shard — Grade A', desc: 'Resonates at exactly 440 Hz. Concert A.',      location: 'CrystalCanyonOutpost',         found: false },
  { id: 'col_10', name: 'Tunnel Ice Core',          desc: 'Contains organic compounds 200,000 years old.', location: 'ResearchBase_Tunnels',      found: false }
];

// Journal of overheard NPC lines
const heardLog = [];

// ================================================================
// Save / Restore
// ================================================================
const SAVE_KEY = 'distania_save';

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      currentLocation, currentHub, currentSubLocation,
      missions: MISSIONS.map(m => ({ id: m.id, complete: m.complete })),
      collectibles: COLLECTIBLES.map(c => ({ id: c.id, found: c.found })),
      novaRel
    }));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s.currentHub || !destinationConfigs[s.currentHub]) return false;
    currentLocation    = s.currentLocation;
    currentHub         = s.currentHub;
    currentSubLocation = s.currentSubLocation;
    if (s.missions) s.missions.forEach(saved => {
      const m = MISSIONS.find(m => m.id === saved.id);
      if (m) m.complete = saved.complete;
    });
    if (s.collectibles) s.collectibles.forEach(saved => {
      const c = COLLECTIBLES.find(c => c.id === saved.id);
      if (c) c.found = saved.found;
    });
    if (s.novaRel) Object.assign(novaRel, s.novaRel);
    return true;
  } catch (_) { return false; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

// ================================================================
// Data Loading
// ================================================================
function onDataReady() {
  if (!destinationsReady || !dialogueReady) return;
  if (pendingStart) { pendingStart = false; startTravelConsole(); }
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
  appendLog('System: Communication array partially offline.', 'log-system');
  dialogueReady = true;
  onDataReady();
});

// ================================================================
// Fallback Destinations (mirrors destinations.json structure)
// ================================================================
function loadFallbackDestinations() {
  appendLog('System: Navigation data unavailable — loading emergency backup.', 'log-system');
  const fallback = {
    mainDestinations: [
      { name: 'Earth', key: 'Earth' }, { name: 'Mars Colony Alpha', key: 'Mars' },
      { name: 'Jupiter Orbital Station', key: 'Jupiter' }, { name: 'Europa Research Base', key: 'Europa' },
      { name: 'Andromeda Outpost', key: 'Andromeda' }, { name: 'Vega Prime', key: 'Vega' }
    ],
    destinationConfigs: {
      Earth: { description: 'Orbiting Earth.', travelType: 'train', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'New York Sector', key: 'NewYork', description: 'Rebuilt after the Kilko disaster.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Downtown Core', key: 'NewYork_Downtown', description: 'Center of rebuilt New York.' },
          { name: 'Torta Excavation Site', key: 'NewYork_Torta', description: 'Ongoing megastructure digs.' },
          { name: 'Skyline Transit Nexus', key: 'NewYork_Transit', description: 'Floating vertical transit.' }
        ]},
        { name: 'Earth Space Port', key: 'EarthSpacePort', description: 'Cargo and civilian port.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Processing', key: 'EarthSpacePort_FrontDesk', description: 'Civilian and cargo inspection.' },
          { name: 'Cargo Intake', key: 'EarthSpacePort_Cargo', description: 'Freight unloading zone.' },
          { name: 'Docking Bay', key: 'EarthSpacePort_Docking', description: 'Refueling and boarding.' }
        ]},
        { name: 'Pacific Research Facility', key: 'Pacific', description: 'Floating research base.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Kilko Artifact Lab', key: 'Pacific_ArtifactLab', description: 'Kilko debris containment.' },
          { name: 'Deep Sea Observatory', key: 'Pacific_Observatory', description: 'Submersible monitoring.' },
          { name: 'Abyssal Research Wing', key: 'Pacific_Abyssal', description: 'Pressurized deep trench labs.' }
        ]}
      ]},
      Mars: { description: 'Orbiting Mars Colony Alpha.', travelType: 'shuttle', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'Colony Core', key: 'ColonyCore', description: 'Heart of Martian habitation.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Residential Dome', key: 'ColonyCore_Residential', description: 'Colonist quarters.' },
          { name: 'Central Market', key: 'ColonyCore_Market', description: 'Commercial hub.' },
          { name: 'Power Hub', key: 'ColonyCore_Power', description: 'Life support power.' }
        ]},
        { name: 'Terraforming Fields', key: 'TerraformingFields', description: 'Atmosphere processors.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Ancient Vault', key: 'AncientVault', description: 'Pre-human vault.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] }
      ]},
      Jupiter: { description: 'Orbiting Jupiter Orbital Station.', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'Storm Observatory', key: 'StormObservatory', description: 'Jupiter storm monitoring.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Sensor Array', key: 'StormObservatory_Sensors', description: 'EM field sensors.' },
          { name: 'Atmospheric Lab', key: 'StormObservatory_Lab', description: 'Weather research.' }
        ]},
        { name: 'Gas Harvesting Platform', key: 'GasHarvester', description: 'Fuel siphoning.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Research Array', key: 'ResearchArray', description: 'Drone sensor network.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Deep Core Relay', key: 'CoreRelay', description: 'Deep atmosphere comms.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Excavation Platforms', key: 'ExcavationPlatforms', description: 'Ring excavation.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] }
      ]},
      Europa: { description: 'Orbiting Europa Research Base.', travelType: 'rover', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'Research Base', key: 'ResearchBase', description: 'Core Europa station.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Subsurface Tunnels', key: 'ResearchBase_Tunnels', description: 'Ice tunnels below.' },
          { name: 'AI Lab', key: 'ResearchBase_Lab', description: 'AI behavior research.' },
          { name: 'Core Chamber', key: 'ResearchBase_Core', description: 'Flooded cavern.' }
        ]},
        { name: 'Ground Camp', key: 'GroundCamp', description: 'Field drilling base.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Ruins', key: 'Ruins', description: 'Ancient megastructure under ice.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] }
      ]},
      Andromeda: { description: 'Orbiting Andromeda Outpost.', travelType: 'shuttle', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'Forward Recon Station', key: 'ForwardRecon', description: 'Deep-space monitoring.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Black Spire Relay', key: 'BlackSpire', description: 'Quantum signal relay.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Xeno Archives', key: 'XenoArchives', description: 'Alien artifact vault.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Statue Research Wing', key: 'StatueWing', description: 'Chamber of alien statues.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] }
      ]},
      Vega: { description: 'Orbiting Vega Prime.', subDestinations: [
        { name: 'Return to Ship', key: 'Return' },
        { name: 'Capital City', key: 'CapitalCity', description: 'Neon metropolis.', subDestinations: [
          { name: 'Return to Previous', key: 'Return' },
          { name: 'Tech District', key: 'CapitalCity_Tech', description: 'AI and startup hub.' },
          { name: 'Underdeck Market', key: 'CapitalCity_Market', description: 'Black market.' },
          { name: 'Central Core', key: 'CapitalCity_Core', description: 'City processors.' }
        ]},
        { name: 'Orbital Trade Ring', key: 'OrbitalTradeRing', description: 'Trade ring.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Stellar Observation Spire', key: 'StellarObservationSpire', description: 'First to spot megastructures.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] },
        { name: 'Crystal Canyon Outpost', key: 'CrystalCanyonOutpost', description: 'Gem mines.', subDestinations: [{ name: 'Return to Previous', key: 'Return' }] }
      ]}
    }
  };
  mainDestinations.push(...fallback.mainDestinations);
  Object.assign(destinationConfigs, fallback.destinationConfigs);
}

// ================================================================
// Log Helper — colour-coded by type
// ================================================================
function appendLog(text, cssClass = '') {
  const line = document.createElement('div');
  line.textContent = text.trim();
  if (cssClass) line.classList.add(cssClass);
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// ================================================================
// Boot Typewriter
// ================================================================
const BOOT_TEXT = `Welcome recruit to the Exodus Civil Service — the ECS. We work for the unified governments to explore the mega structures that arrived during the Kilko disaster. We must discover who built them, their purpose, how old they are, and most importantly, why they are here. Good luck explorer. Your ship is waiting.`;

function runBootSequence() {
  const bootEl  = document.getElementById('bootText');
  const sigEl   = document.getElementById('bootSig');
  const procBtn = document.getElementById('proceedBtn');

  bootEl.classList.add('typing');
  let i = 0;
  const speed = 28;

  const type = () => {
    if (i < BOOT_TEXT.length) {
      bootEl.textContent += BOOT_TEXT[i++];
      setTimeout(type, speed);
    } else {
      bootEl.classList.remove('typing');
      sigEl.classList.add('visible');
      setTimeout(() => procBtn.classList.remove('hidden'), 600);
    }
  };
  setTimeout(type, 400);
}

// ================================================================
// Nova AI
// ================================================================
const NovaAI = {
  dialogue: {},
  idleTimer: null,

  speak(category) {
    const pool = this.dialogue[category];
    if (!pool?.length) return;
    // Warm pool after 5 completions — richer idle lines if they exist
    const line = pool[Math.floor(Math.random() * pool.length)];
    appendLog(line, 'log-nova');
  },

  speakLocation(key) {
    const line = this.dialogue.locationArrivals?.[key];
    if (line) appendLog(line, 'log-nova');
  },

  startIdle() {
    clearInterval(this.idleTimer);
    this.idleTimer = setInterval(() => {
      if (!traveling && Math.random() < 0.6) this.speak('idle');
    }, 45000);
  },

  stopIdle() { clearInterval(this.idleTimer); }
};

// ================================================================
// Mission System
// ================================================================
function getActiveMission() {
  return MISSIONS.find(m => !m.complete) || null;
}

function updateMissionIndicator() {
  const active = getActiveMission();
  missionIndicator.classList.toggle('hidden', !active);
}

function checkMissionCompletion(locationKey) {
  const m = getActiveMission();
  if (!m || m.target !== locationKey) return;
  m.complete = true;
  novaRel.completions++;
  appendLog(`▶ MISSION COMPLETE: ${m.title}`, 'log-mission');
  appendLog(`▶ REWARD LOGGED: ${m.reward}`, 'log-mission');
  NovaAI.speak('missionComplete');
  updateMissionIndicator();
  saveState();

  // Queue the next mission announcement after a short pause
  const next = getActiveMission();
  if (next) {
    setTimeout(() => {
      appendLog(`▶ NEW MISSION DISPATCHED: ${next.title}`, 'log-mission');
      appendLog(`  ${next.desc}`, 'log-mission');
    }, 4000);
  }
}

// ================================================================
// Collectible System
// ================================================================
function checkCollectible(locationKey) {
  const col = COLLECTIBLES.find(c => c.location === locationKey && !c.found);
  if (!col) return;
  // 65% chance to find it on visit
  if (Math.random() > 0.65) return;
  col.found = true;
  appendLog(`◆ ITEM FOUND: ${col.name}`, 'log-collect');
  appendLog(`  ${col.desc}`, 'log-collect');
  NovaAI.speak('collectibleFound');
  saveState();
}

// ================================================================
// Ambient Dialogue (shuffle queue)
// ================================================================
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextAmbientMessage(key) {
  if (!ambientQueues[key]?.length) {
    ambientQueues[key] = shuffled(ambientDialogue[key] || []);
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
  appendLog(`${msg.speaker}: "${msg.line}"`, 'log-npc');
  heardLog.unshift({ speaker: msg.speaker, line: msg.line, location: key, time: new Date().toLocaleTimeString() });
  if (heardLog.length > 60) heardLog.pop();
}

function clearAmbientTimers() {
  clearTimeout(ambientFirstTimer);
  clearInterval(ambientTimer);
  ambientFirstTimer = ambientTimer = null;
}

// ================================================================
// Danger Events (random chance on arrival at certain locations)
// ================================================================
const DANGER_LOCATIONS = ['NewYork_Torta','AncientVault','ResearchBase_Tunnels','Ruins','ExcavationPlatforms','Pacific_Abyssal'];
const DANGER_LINES = [
  'Nova: Captain — I\'m reading an energy spike at your location. Get clear if you can.',
  'Nova: Structural anomaly detected. The readings lasted about four seconds. I\'m logging it.',
  'Nova: Something just moved on the thermal scan. Too fast to identify. Stay sharp.',
  'Nova: Brief electromagnetic pulse from deep below. Equipment should recover. Should.',
  'Nova: I lost your vitals for two seconds. You\'re fine now. I\'m fine. Everything is fine.'
];

function maybeTriggerDanger(key) {
  if (!DANGER_LOCATIONS.includes(key)) return;
  if (Math.random() > 0.35) return;
  const delay = 12000 + Math.random() * 15000;
  setTimeout(() => {
    if (currentLocation !== key) return;
    const line = DANGER_LINES[Math.floor(Math.random() * DANGER_LINES.length)];
    appendLog(line, 'log-nova');
  }, delay);
}

// ================================================================
// Journal Rendering
// ================================================================
function renderJournal() {
  renderMissionsTab();
  renderHeardTab();
  renderCollectedTab();
  missionLogOverlay.classList.remove('hidden');
}

function renderMissionsTab() {
  const el = document.getElementById('missionsList');
  el.innerHTML = '';
  MISSIONS.forEach(m => {
    const card = document.createElement('div');
    card.className = `mission-card${m.complete ? ' complete' : ''}`;
    card.innerHTML = `
      <div class="mission-title">${m.title}</div>
      <div class="mission-status-badge">${m.complete ? '✓ COMPLETE' : '● IN PROGRESS'}</div>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-target">Target: ${m.target}</div>
      <div class="mission-reward">Reward: ${m.complete ? m.reward : '???'}</div>
    `;
    el.appendChild(card);
  });
}

function renderHeardTab() {
  const el = document.getElementById('heardList');
  el.innerHTML = '';
  if (!heardLog.length) {
    el.innerHTML = '<div class="empty-state">Nothing overheard yet. Explore and listen.</div>';
    return;
  }
  heardLog.forEach(({ speaker, line, location, time }) => {
    const entry = document.createElement('div');
    entry.className = 'heard-entry';
    entry.innerHTML = `<div class="heard-meta">[${time}] ${location}</div>${speaker}: "${line}"`;
    el.appendChild(entry);
  });
}

function renderCollectedTab() {
  const el = document.getElementById('collectedList');
  el.innerHTML = '';
  const found = COLLECTIBLES.filter(c => c.found);
  if (!found.length) {
    el.innerHTML = '<div class="empty-state">No items collected yet.</div>';
    return;
  }
  found.forEach(c => {
    const entry = document.createElement('div');
    entry.className = 'collect-entry';
    entry.innerHTML = `
      <div class="collect-name">${c.name}</div>
      <div class="collect-desc">${c.desc}</div>
      <div class="collect-where">Found at: ${c.location}</div>
    `;
    el.appendChild(entry);
  });
}

// Tab switching
function initJournalTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => { t.classList.remove('active'); t.classList.add('hidden'); });
      btn.classList.add('active');
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      target.classList.remove('hidden');
      target.classList.add('active');
      // Re-render active tab
      if (btn.dataset.tab === 'missions')   renderMissionsTab();
      if (btn.dataset.tab === 'heard')      renderHeardTab();
      if (btn.dataset.tab === 'collected')  renderCollectedTab();
    });
  });
}

// ================================================================
// Button Helpers
// ================================================================
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
    // Mark if this is a mission target
    const active = getActiveMission();
    if (active && active.target === dest.key) {
      btn.textContent = `${dest.name} ●`;
      btn.title = 'Mission target';
    }
    destList.appendChild(btn);
    btn.addEventListener('click', () => handleDestinationClick(dest, btn));
  });
}

// ================================================================
// Navigation Helpers
// ================================================================
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
    { name: 'Return to Previous', key: 'Return' },
    { name: `${dest.name} Core Zone`, key: `${dest.key}_1` },
    { name: `${dest.name} Outer Sector`, key: `${dest.key}_2` }
  ];
}

// ================================================================
// Click Handler
// ================================================================
function handleDestinationClick(dest, btn) {
  if (traveling) return;
  if (dest.key === 'Return') { handleReturn(); return; }

  const isMain = mainDestinations.some(d => d.key === dest.key);
  if (isMain && !currentHub) { travelMain(dest, btn); return; }

  if (currentHub) {
    const config = destinationConfigs[currentHub];
    if (config.subDestinations?.some(d => d.key === dest.key)) { travelSub(dest, btn, config); return; }
    if (currentLocation) {
      const parent = findByKey(currentLocation, config.subDestinations);
      if (parent?.subDestinations?.some(d => d.key === dest.key)) { travelSubSub(dest, btn, parent); return; }
    }
  }
}

// ================================================================
// Return
// ================================================================
function handleReturn() {
  clearAmbientTimers();
  NovaAI.stopIdle();

  if (currentSubLocation) {
    const config = destinationConfigs[currentHub];
    const parent = findByKey(currentSubLocation, config.subDestinations);
    if (parent?.subDestinations) {
      appendLog(`System: Returning to ${parent.name}.`, 'log-system');
      currentLocation    = currentSubLocation;
      currentSubLocation = null;
      createButtons(parent.subDestinations);
      startAmbientDialogue(currentLocation);
      NovaAI.startIdle();
      saveState();
      return;
    }
  }

  if (currentLocation && currentLocation !== currentHub) {
    const config = destinationConfigs[currentHub];
    appendLog(`System: Returning to ${currentHub} sectors.`, 'log-system');
    currentLocation    = currentHub;
    currentSubLocation = null;
    createButtons(config.subDestinations);
    NovaAI.startIdle();
    saveState();
    return;
  }

  appendLog('System: Returning to ship. Please select a destination.', 'log-system');
  currentLocation = currentHub = currentSubLocation = null;
  clearSave();
  createButtons(mainDestinations);
}

// ================================================================
// Travel Core
// ================================================================
function beginTravel(btn) {
  traveling = true;
  clearAmbientTimers();
  NovaAI.stopIdle();
  destList.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.remove('selected'); });
  if (btn) btn.classList.add('selected');
}

function endTravel(loc, hub, sub = null) {
  currentLocation = loc; currentHub = hub; currentSubLocation = sub;
  traveling = false;
  novaRel.visits++;
  enableButtons();
  saveState();
}

function showOverlay(msg) {
  travelOverlay.textContent = msg;
  travelOverlay.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => travelOverlay.classList.add('active')));
}

function hideOverlay() {
  travelOverlay.classList.remove('active');
  setTimeout(() => travelOverlay.classList.add('hidden'), 700);
}

// On arrival: run all arrival side-effects
function onArrival(key) {
  NovaAI.speak('arrival');
  NovaAI.speakLocation(key);
  checkMissionCompletion(key);
  checkCollectible(key);
  maybeTriggerDanger(key);
  startAmbientDialogue(key);
  NovaAI.startIdle();
  updateMissionIndicator();
}

// ================================================================
// Travel Functions
// ================================================================
function travelMain(dest, btn) {
  beginTravel(btn);
  NovaAI.speak('travel');
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`, 'log-system');
  showOverlay(`Engaging transit to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Zero-point travel complete. Welcome to ${dest.name}.`, 'log-system');
    const config = destinationConfigs[dest.key];
    if (config?.description) appendLog(config.description, 'log-system');
    endTravel(dest.key, dest.key, null);
    createButtons(config.subDestinations);
    onArrival(dest.key);
  }, 3000);
}

function travelSub(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak('travel');
  const type = dest.travelType || config.travelType || 'shuttle';
  const labels = { drone: 'Deploying drone', orbit: 'Initiating orbital alignment', rover: 'Boarding the rover', shuttle: 'Boarding the shuttle', train: 'Boarding the train' };
  const label = labels[type] || 'Traveling';

  appendLog(`System: ${label} to ${dest.name}...`, 'log-system');
  showOverlay(`${label} to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Arrived at ${dest.name}.`, 'log-system');
    if (dest.description) appendLog(dest.description, 'log-system');
    if (!dest.subDestinations) dest.subDestinations = defaultSubs(dest);
    endTravel(dest.key, currentHub, null);
    createButtons(dest.subDestinations);
    onArrival(dest.key);
  }, type === 'drone' ? 2000 : 3000);
}

function travelSubSub(dest, btn, parentDest) {
  beginTravel(btn);
  NovaAI.speak('travel');
  appendLog(`System: Traveling deeper to ${dest.name}...`, 'log-system');
  showOverlay(`Traveling deeper to ${dest.name}...`);

  setTimeout(() => {
    hideOverlay();
    appendLog(`System: Arrived at ${dest.name}.`, 'log-system');
    if (dest.description) appendLog(dest.description, 'log-system');
    if (!dest.subDestinations) dest.subDestinations = defaultSubs(dest);
    endTravel(dest.key, currentHub, parentDest.key);
    createButtons(dest.subDestinations);
    onArrival(dest.key);
  }, 2000);
}

// ================================================================
// Restore Session
// ================================================================
function restoreSession() {
  if (!loadState()) {
    appendLog('System: Welcome, Captain. Please select a destination.', 'log-system');
    const first = getActiveMission();
    if (first) {
      setTimeout(() => {
        appendLog(`▶ MISSION DISPATCHED: ${first.title}`, 'log-mission');
        appendLog(`  ${first.desc}`, 'log-mission');
        updateMissionIndicator();
      }, 1500);
    }
    createButtons(mainDestinations);
    return;
  }

  appendLog(`System: Session restored. Last known location: ${currentLocation}.`, 'log-system');
  NovaAI.speakLocation(currentLocation);
  updateMissionIndicator();

  if (currentSubLocation) {
    const config = destinationConfigs[currentHub];
    const parent = findByKey(currentSubLocation, config.subDestinations);
    if (parent?.subDestinations) { createButtons(parent.subDestinations); startAmbientDialogue(currentLocation); NovaAI.startIdle(); return; }
  }

  if (currentLocation && currentLocation !== currentHub) {
    const config = destinationConfigs[currentHub];
    const dest   = findByKey(currentLocation, config.subDestinations);
    if (dest?.subDestinations) { createButtons(dest.subDestinations); startAmbientDialogue(currentLocation); NovaAI.startIdle(); return; }
  }

  createButtons(destinationConfigs[currentHub].subDestinations);
  NovaAI.startIdle();
}

function startTravelConsole() {
  journalToggle.classList.remove('hidden');
  restoreSession();
}

// ================================================================
// Event Listeners
// ================================================================
window.addEventListener('DOMContentLoaded', () => {
  initJournalTabs();

  document.getElementById('proceedBtn')?.addEventListener('click', e => {
    e.preventDefault();
    startupScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
  });

  document.getElementById('onBtn')?.addEventListener('click', e => {
    e.preventDefault();
    loginScreen.classList.add('hidden');
    travelScreen.classList.remove('hidden');
    if (destinationsReady && dialogueReady) {
      startTravelConsole();
    } else {
      appendLog('System: Loading navigation data...', 'log-system');
      pendingStart = true;
    }
  });

  journalToggle?.addEventListener('click', renderJournal);

  document.getElementById('closeJournal')?.addEventListener('click', () => {
    missionLogOverlay.classList.add('hidden');
  });

  // Start boot sequence immediately
  runBootSequence();
});
