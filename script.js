// =======================
// DOM Elements
// =======================
const startupScreen = document.getElementById('startupScreen');
const loginScreen = document.getElementById('loginScreen');
const travelScreen = document.getElementById('travelScreen');
const proceedBtn = document.getElementById('proceedBtn');
const onBtn = document.getElementById('onBtn');
const destList = document.querySelector('.dest-list');
const logEl = document.getElementById('log');

// =======================
// State Variables
// =======================
let traveling = false;
let currentLocation = null;
let currentHub = null;
let ambientTimer = null;
const AMBIENT_INTERVAL = 30000;

// =======================
// Configuration Data
// =======================
const mainDestinations = [
  { name: "Earth", key: "Earth" },
  { name: "Mars Colony Alpha", key: "Mars" },
  { name: "Jupiter Orbital Station", key: "Jupiter" },
  { name: "Europa Research Base", key: "Europa" },
  { name: "Andromeda Outpost", key: "Andromeda" },
  { name: "Vega Prime", key: "Vega" },
];

const destinationConfigs = {
  Earth: {
    description: "Orbiting Earth, the fractured home of humanity. The once-beautiful world lies fractured, but humanity persists in the ruins of the kilko disaster",
    travelType: "train",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "New York Sector", key: "NewYork" },
      { name: "Earth Space Port", key: "EarthSpacePort" },
      { name: "Pacific Research Facility", key: "Pacific" },
    ],
    sectorDescriptions: {
      NewYork: "A massive sprawling city, a far cry from the concrete jungle of old, its more spread out layout in the modern day after its rebuilding has brought new york into the modern day. Its proximity to the Torta structures fuels its economy.",
      EarthSpacePort: "A large cargo and civilian port that once fueled the Red War, its defenses await an enemy long since defeated. Now a gateway for imports to Earth's mega cities.",
      Pacific: "A massive floating research base that studies artifacts from the Kilko disaster and other megastructures across the system, its the main research hub for humanity but its reputation has been tarnished by the kilko disaster"
    }
  },
  Mars: {
    description: "Orbiting Mars Colony Alpha, a sprawling network of habitats and terraforming stations.",
    travelType: "shuttle",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Colony Core", key: "ColonyCore" },
      { name: "Terraforming Fields", key: "TerraformingFields" },
      { name: "Ancient Vault", key: "AncientVault" },
    ],
    sectorDescriptions: {
      ColonyCore: "The beating heart of the terraforming effort, home to shops and homes. One of the few cities that survived the Kilko disaster.",
      TerraformingFields: "Engineers work here to make Mars habitable. Machinery hums endlessly, reshaping the planet into its once green self as they avoid the mars mega structure",
      AncientVault: "An ancient vault emerged during the Kilko disaster. It wiped out cities, turned back time, and turned Mars red again."
    }
  },
  Europa: {
    description: "Orbiting Europa Research Base, a scientific station monitoring the icy moon’s hidden ocean.",
    travelType: "rover",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Research Base", key: "ResearchBase", type: "rover" },
      { name: "Ground Camp", key: "GroundCamp" },
      { name: "Ruins", key: "Ruins" },
    ],
    sectorDescriptions: {
      ResearchBase: "A hub of scientific activity focused on Europa’s ice crust and subsurface ocean, it has massive subsurface tunnels that lead to the mega structure below ending in a mini city sized air pocket where they work.",
      GroundCamp: "A rugged outpost supporting field teams. Built around an entrance to the megastructure.",
      Ruins: "A hidden megastructure buried under Europa's ice. It may predate all known civilizations."
    }
  },
  Jupiter: {
    description: "Orbiting the Jupiter Orbital Station...",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Storm Observatory", key: "StormObservatory", type: "shuttle" },
      { name: "Gas Harvesting Platform", key: "GasHarvester", type: "shuttle" },
      { name: "Research Array", key: "ResearchArray", type: "drone" },
      { name: "Deep Core Relay", key: "CoreRelay", type: "shuttle" },
      { name: "Excavation Platforms", key: "ExcavationPlatforms", type: "shuttle" },
    ],
    sectorDescriptions: {
      StormObservatory: "Observes Jupiter’s massive storms and protects orbital stations from said stroms by adjusting how close they are to the surface",
      GasHarvester: "Harvests gases for fuel. Vital to all logistics and ships.",
      ResearchArray: "Sensor nodes study Jupiter's magnetic field, the array is entirely automated and drones can be seen darting between the various sensors",
      CoreRelay: "Deep in the atmosphere, this hub maintains long-range communication with mega stucture exploration teams and the stations",
      ExcavationPlatforms: "Digs into Jupiter’s gas layers for its ancient megastructure, a decaying massive ring deep in the gas, its purpose unknown and one of the few humanity is capable of exploring"
    }
  },
  Vega: {
    description: "Orbiting Vega Prime, a vibrant star system hub...",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Capital City", key: "CapitalCity", type: "shuttle" },
      { name: "Orbital Trade Ring", key: "OrbitalTradeRing", type: "orbit" },
      { name: "Stellar Observation Spire", key: "StellarObservationSpire", type: "orbit" },
      { name: "Crystal Canyon Outpost", key: "CrystalCanyonOutpost", type: "shuttle" },
    ],
    sectorDescriptions: {
      CapitalCity: "A neon metropolis untouched by the Kilko disaster.",
      OrbitalTradeRing: "Commerce and supply hub for Vega Prime.",
      StellarObservationSpire: "This is where the megastructures were first discovered.",
      CrystalCanyonOutpost: "Gem mines that power everything from ships to phones."
    }
  },
  Andromeda: {
    description: "Orbiting the Andromeda Outpost, a forward base for deep space exploration...",
    travelType: "shuttle",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Forward Recon Station", key: "ForwardRecon", type: "drone" },
      { name: "Black Spire Relay", key: "BlackSpire" },
      { name: "Xeno Archives", key: "XenoArchives", type: "shuttle" },
    ],
    sectorDescriptions: {
      ForwardRecon: "An unmanned station monitoring deep space anomalies.",
      BlackSpire: "A jagged relay station transmitting signals between galaxies.",
      XenoArchives: "Vault of alien artifacts and encrypted data."
    }
  }
};

// =======================
// Ambient Dialogue Pools (integrated with rare/rumor system)
// =======================

// Normal (existing) dialogue
const NormalDialogue = {
  NewYork: [
    { speaker: "Technician", line: "Just patched another conduit. Third one this week." },
    { speaker: "Trader", line: "Shipping lanes are still backed up. Blame the kolki disaster and the amount of space debris it caused thats not cleaned up" },
    { speaker: "Civilian", line: "You ever wonder what’s *under* the megastructure?" },
    { speaker: "Courier", line: "My route got rerouted again...every damn time I do this job" },
    { speaker: "Patrolman", line: "Keep moving. Streets are restricted beyond block 5." },
    { speaker: "ECS Marine", line: "What out for the torta structure friend, grounds unstable today" },
    { speaker: "ECS Officer", line: "Enjoy your stay friend, the ECS HQ is at oregon if you need to visit, it'll be open for travel soon" },
    { speaker: "Administrative AI", line: "Reminder: Only you can prevent another kilko disaster! Report occult activity or anything strange with mega structures to the authorities immediately!" }
  ],
  EarthSpacePort: [
    { speaker: "Dockmaster", line: "Cargo bay 3 is sealed. Ready for next drop." },
    { speaker: "Security Guard", line: "Keep an eye on bay 7. Something's off." },
    { speaker: "Engineer", line: "Old warships still give me the chills, ghosts haunt them museum ships" },
    { speaker: "Pilot", line: "A Venus run beats this chaos any day." },
    { speaker: "Load Chief", line: "No one's touched bay 12 in hours. Go check." },
    { speaker: "Cargo mover", line: "Bay 12 is cursed, during the red war some occult bastards bombed it, killed a lot of people, not everyone who died moved on" }
  ],
  Pacific: [
    { speaker: "Researcher", line: "Another reading spike. That can't be good..." },
    { speaker: "AI Assistant", line: "Reminder: hydration is optimal for humans." },
    { speaker: "Archivist", line: "I swear one of the artifacts moved." },
    { speaker: "Diver", line: "I saw light beneath grid 3. Unnatural light, but it was deeper than my approved depth limit." },
    { speaker: "Communication Expert", line: "Relay's been glitching all morning. Again." },
    { speaker: "Researcher", line: "I was there during the kilko disaster, I was lukily in oregon, it was untouched by the disaster and is now home to a thriving mega city and ECS." },
    { speaker: "Secuirty Guard", line: "Your only authorized for floors 1-3 do not try and access 4-10 or I'll have to remove you from site" }
  ]
  // (Other sectors already have their own pools below; you can expand them similarly if you want rare variants per sector)
};

// Rare / rumor dialogue
const RareDialogue = {
  NewYork: [
    { speaker: "Whispered Voice", line: "They say the megastructure wasn’t built... it grew." },
    { speaker: "Street Informant", line: "Watch the skies. A ghost ship’s been seen in orbit again." },
    { speaker: "Elder", line: "Before the kilko disaster, the stars over New York shone differently." },
    { speaker: "Unknown Transmission", line: "—[garbled]— THEY'RE STILL HERE —[signal lost]—" },
    { speaker: "Courier", line: "A package I delivered yesterday… wasn’t there when they opened it." }
  ],
  EarthSpacePort: [
    { speaker: "Dockside Rumormonger", line: "A freighter vanished mid-jump last night. All that came back was the hull… empty." },
    { speaker: "Pilot", line: "There’s a corridor in bay 4 that isn’t on any blueprint." },
    { speaker: "Ground Crew", line: "I heard a cry for help from inside a sealed cargo crate." },
    { speaker: "Security Guard", line: "Keep your voice down—military’s moving something classified through here today." },
    { speaker: "Maintenance Worker", line: "Bay 12’s radiation meters keep ticking up... even with no cargo inside." }
  ],
  Pacific: [
    { speaker: "Diver", line: "Something followed me up from the trench... I swear I saw it in my reflection." },
    { speaker: "Research Assistant", line: "The archive has a floor nobody’s allowed to talk about." },
    { speaker: "AI Assistant", line: "Warning: Unknown sonar contact detected beneath your position." },
    { speaker: "Marine Biologist", line: "These readings… they match the ones from the night before the kilko disaster." },
    { speaker: "Oceanographer", line: "One of the drones came back with a human voice recorded... three kilometers under." }
  ]
};

// Optional panic/emergency overrides
const PanicOverrides = {
  NewYork: [
    { speaker: "Emergency Broadcaster", line: "Evacuate block 3. Structural resonance exceeds safe thresholds." },
    { speaker: "Patrolman", line: "All civilians, clear the sector. Unauthorized presence will be detained." },
    { speaker: "ECS Officer", line: "Containment breach in level 2. Do not approach without clearance." }
  ],
  EarthSpacePort: [
    { speaker: "Dockmaster", line: "Unauthorized jump signature detected—lockdown initiated." },
    { speaker: "Security Guard", line: "All personnel to safe zones. Intrusion in hyperspace corridor." },
    { speaker: "Pilot", line: "Abort departure; nav beacons are spiking erratically." }
  ],
  Pacific: [
    { speaker: "Researcher", line: "Seismic fluctuation escalating—pull all field teams back now!" },
    { speaker: "AI Assistant", line: "Alert: Deep ocean anomaly expanding faster than predicted." },
    { speaker: "Field Medic", line: "Casualty reports incoming. Prepare triage protocols." }
  ]
};

// Cooldown state to avoid immediate repeats
const recentCache = {
  NewYork: { last: null, cooldown: 2, counter: 0 },
  EarthSpacePort: { last: null, cooldown: 2, counter: 0 },
  Pacific: { last: null, cooldown: 2, counter: 0 }
  // extend for other keys if you apply rare/normal logic to them too
};

// === Ambient selection logic ===
function getAmbientLine(location, options = {}) {
  const { rareChance = 0.08, panic = false } = options;

  if (panic) {
    const pool = PanicOverrides[location] || [];
    if (pool.length) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  const useRare = Math.random() < rareChance;
  const pool = useRare
    ? (RareDialogue[location] || [])
    : (NormalDialogue[location] || []);

  if (!pool || pool.length === 0) {
    return { speaker: "System", line: "No ambient data available." };
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function getAmbientLineWithCooldown(location, options = {}) {
  const entry = getAmbientLine(location, options);
  const state = recentCache[location];
  if (state) {
    if (state.last && entry.line === state.last.line && state.counter < state.cooldown) {
      state.counter += 1;
      // fallback to normal if possible
      const fallbackPool = NormalDialogue[location] || [];
      if (fallbackPool.length) {
        const fallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        state.last = fallback;
        state.counter = 0;
        return fallback;
      }
    }
    // accept entry
    state.last = entry;
    state.counter = 0;
  }
  return entry;
}

// Panic event controller
let activePanic = { location: null, expiresAt: 0 };
function triggerPanic(location, durationMs) {
  activePanic = { location, expiresAt: Date.now() + durationMs };
}
function isPanicActive(location) {
  return activePanic.location === location && Date.now() < activePanic.expiresAt;
}

// =======================
// Core Functions
// =======================
function appendLog(text) {
  const line = document.createElement('div');
  line.textContent = text;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// =======================
// Nova AI System
// =======================
const NovaAI = {
  dialogue: {
    travel: [
      "Nova: Initializing travel systems. Brace for inertial shift.",
      "Nova: Course plotted. We should arrive unscathed.",
      "Nova: Activating field dampeners. I trust your stomach's stable.",
      "Nova: Don't worry, I’ve run simulations. Only one exploded.",
      "Nova: Next stop, the void between places.",
      "Nova: Ignore any impacts you hear, its probably just an asteroid.",
      "Nova: Hull integrity holding at 100%, brace for arrival"
    ],
    arrival: [
      "Nova: Arrival confirmed. No hull breaches detected.",
      "Nova: Welcome. Conditions seem... breathable.",
      "Nova: Surface scans are returning anomalies. Intriguing.",
      "Nova: I suggest keeping your helmet on.",
      "Nova: We've arrived. Try not to break anything, Captain.",
      "Nova: The stars are beautiful here at night",
      "Nova: Remeber to take your pistol, theives can't steal if their not breathing!",
      "Nova: If you can, can you uh, get me a AI body? I assure its better than me being a dismebodied ship voice"
    ],
    idle: [
      "Nova: Systems green. Do you require anything, Captain?",
      "Nova: Monitoring sensors. Silence is... eerie.",
      "Nova: No threats detected. For now.",
      "Nova: If you're contemplating, I recommend the Vega view.",
      "Nova: I’ve re-calibrated your neural quiet mode. You're welcome.",
      "Nova: I don't like it when you get quiet, do I need to phone a friend?",
      "Nova: Nova: Please tell me you're not experiencing PTSD, Captain. The last time was... unideal.",
      "Nova: I wish I had a body like that old video game character, her name starts with a C?"
    ]
  },

  speak(category) {
    const lines = this.dialogue[category];
    if (!lines || lines.length === 0) return;
    const line = lines[Math.floor(Math.random() * lines.length)];
    appendLog(line);
  },

  idleTimer: null,

  startIdle() {
    clearInterval(this.idleTimer);
    this.idleTimer = setInterval(() => {
      if (!traveling && Math.random() < 0.6) {
        this.speak("idle");
      }
    }, 45000);
  },

  stopIdle() {
    clearInterval(this.idleTimer);
  }
};

function clearDestinations() {
  destList.innerHTML = '<h2>Select Destination</h2>';
}

function enableButtons() {
  destList.querySelectorAll('button').forEach(btn => btn.disabled = false);
}

function createButtons(destinations) {
  clearDestinations();
  destinations.forEach(dest => {
    const btn = document.createElement('button');
    btn.textContent = dest.name;
    btn.dataset.dest = dest.key;
    destList.appendChild(btn);
    btn.addEventListener('click', () => handleDestinationClick(dest, btn));
  });
}

function handleDestinationClick(dest, btn) {
  if (traveling) return;

  const isReturn = dest.key === 'Return';
  const isMainDest = mainDestinations.some(d => d.key === dest.key);

  if (isReturn) {
    currentLocation = null;
    currentHub = null;
    clearInterval(ambientTimer);
    createButtons(mainDestinations);
    appendLog("System: Returning to ship. Please select a destination.");
    return;
  }

  if (isMainDest && !currentHub) {
    const config = destinationConfigs[dest.key];
    currentHub = dest.key;
    currentLocation = dest.key;
    appendLog(`System: ${config.description}`);
    createButtons(config.subDestinations);
    appendLog(`System: Accessing ${dest.name} sectors.`);
    return;
  }

  if (currentHub) {
    const config = destinationConfigs[currentHub];
    const isValidSub = config.subDestinations?.some(d => d.key === dest.key);
    if (isValidSub) {
      travelToSubDestination(dest, btn, config);
      return;
    }
  }

  if (isMainDest) {
    travelToMainDestination(dest, btn);
  }
}

function travelToMainDestination(dest, btn) {
  beginTravel(btn);
  NovaAI.speak("travel");
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  showTravelOverlay(`Engaging transit to ${dest.name}...`);
  setTimeout(() => {
    appendLog(`System: Zero-point travel finished. Welcome to ${dest.name}.`);
    NovaAI.speak("arrival");
    endTravel(dest.key, dest.key);
    hideTravelOverlay();
    NovaAI.startIdle();
  }, 3000);
}

function travelToSubDestination(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak("travel");
  const description = config.sectorDescriptions?.[dest.key];
  const travelType = dest.type || config.travelType || 'shuttle';

  const travelLabel = {
    drone: "Deploying drone",
    orbit: "Initiating orbital alignment",
    rover: "Boarding the rover",
    shuttle: "Boarding the shuttle",
    train: "Boarding the train"
  }[travelType] || "Traveling";

  showTravelOverlay(`${travelLabel} to ${dest.name}...`);
  appendLog(`System: ${travelLabel} to ${dest.name}...`);

  const delay = travelType === 'drone' ? 2000 : 3000;
  setTimeout(() => {
    appendLog(`System: Arrived at ${dest.name}.`);
    if (description) appendLog(description);
    NovaAI.speak("arrival");
    endTravel(dest.key, currentHub);
    hideTravelOverlay(); // 👈 make sure this is here
    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
  }, delay);
}

function beginTravel(btn) {
  traveling = true;
  clearInterval(ambientTimer);
  NovaAI.stopIdle(); // Add this
  destList.querySelectorAll('button').forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
}

function endTravel(newLocation, hubKey) {
  currentLocation = newLocation;
  currentHub = hubKey;
  traveling = false;
  enableButtons();
}

// =======================
// Travel Overlay Logic
// =======================
function showTravelOverlay(message = "Engaging transit...") {
  const overlay = document.getElementById('travelOverlay');
  if (!overlay) return;
  overlay.textContent = message;
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
}

function hideTravelOverlay() {
  const overlay = document.getElementById('travelOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 800); // match the CSS transition duration
}

// =======================
// Ambient Dialogue Logic (using rumor system)
// =======================
function startAmbientDialogue(destKey) {
  clearInterval(ambientTimer);
  if (!destKey) return;

  // initial delayed line
  setTimeout(() => {
    if (currentLocation !== destKey) return;
    const panic = isPanicActive(destKey);
    const { speaker, line } = getAmbientLineWithCooldown(destKey, { rareChance: 0.08, panic }); // 8% base rare chance
    appendLog(`${speaker}: "${line}"`);
  }, 8000);

  // recurring
  ambientTimer = setInterval(() => {
    if (currentLocation !== destKey) {
      clearInterval(ambientTimer);
      return;
    }
    const panic = isPanicActive(destKey);
    const { speaker, line } = getAmbientLineWithCooldown(destKey, { rareChance: 0.08, panic });
    appendLog(`${speaker}: "${line}"`);
  }, AMBIENT_INTERVAL);
}

// =======================
// Event Handlers
// =======================
proceedBtn.addEventListener('click', () => {
  startupScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

onBtn.addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  travelScreen.classList.remove('hidden');
  appendLog("System: Welcome, Captain. Please select a destination.");
  createButtons(mainDestinations);
});
