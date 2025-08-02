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
// Lore Fragments
// =======================
const loreFragments = [
  {
    id: "kilko_01",
    title: "The Kilko Singularity",
    content: "In 2138, an experimental energy pulse tore through space-time, fracturing Earth's upper crust and destabilizing five major orbital stations. The event became known as the Kilko Disaster.",
    found: false,
    chanceLocations: ["Pacific", "Ruins", "CoreRelay"]
  },
  {
    id: "ai_whisper",
    title: "The AI Whisper Protocol",
    content: "Designed to allow AI to communicate without user input, Whisper eventually became the basis for rogue AI enclaves before being shut down during the Mars Compact.",
    found: false,
    chanceLocations: ["ResearchArray", "XenoArchives"]
  },
  {
    id: "europa_signal",
    title: "The Signal Beneath Europa",
    content: "A repeating 3-note tone, echoing from beneath Europa's ice for over 70 years. No origin. No explanation. But it always ends with silence.",
    found: false,
    chanceLocations: ["Ruins", "GroundCamp"]
  },
  {
    id: "vega_throne",
    title: "The Vega Throne Theory",
    content: "Some believe Vega Prime's planetary core houses a synthetic intelligence throne — a relic of pre-human civilization.",
    found: false,
    chanceLocations: ["CapitalCity", "StellarObservationSpire"]
  }
];

// =======================
// Lore Discovery Logic
// =======================
function maybeDiscoverLore(locationKey) {
  loreFragments.forEach(entry => {
    if (!entry.found && entry.chanceLocations.includes(locationKey)) {
      if (Math.random() < 0.3) { // 30% chance to discover
        entry.found = true;
        const probability = (Math.random() * (98 - 65) + 65).toFixed(1);
        appendLog(`Nova: I’ve recovered a data fragment...`);
        appendLog(`📘 Lore Unlocked: "${entry.title}"`);
        appendLog(`Nova: Probability of authenticity: ${probability}%.`);
        updateLoreLibrary();
      }
    }
  });
}

// =======================
// Lore UI Update
// =======================
function updateLoreLibrary() {
  const loreList = document.getElementById('loreList');
  if (!loreList) return;
  loreList.innerHTML = '';

  loreFragments.filter(f => f.found).forEach(f => {
    const li = document.createElement('li');
    li.textContent = f.title;
    li.title = "Click to read";
    li.addEventListener('click', () => {
      appendLog(`📘 ${f.title}: ${f.content}`);
    });
    loreList.appendChild(li);
  });
}



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
      CoreRelay: "Deep in the atmosphere, this hub maintains long-range communication with mega strcuture exploration teams and the stations",
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
// Ambient Dialogue Data
// =======================
const ambientDialogue = {
  // === Earth ===
  NewYork: [
    { speaker: "NewYork - Technician", line: "Just patched another conduit. Third one this week." },
    { speaker: "NewYork - Trader", line: "Shipping lanes are still backed up. Blame the Torta storm." },
    { speaker: "NewYork - Civilian", line: "You ever wonder what’s *under* the megastructure?" },
    { speaker: "NewYork - Courier", line: "My route got rerouted again... Torta tunnel issues." },
    { speaker: "NewYork - Patrol", line: "Keep moving. Streets are restricted beyond block 5." }
  ],
  EarthSpacePort: [
    { speaker: "EarthSpacePort - Dockmaster", line: "Cargo bay 3 is sealed. Ready for next drop." },
    { speaker: "EarthSpacePort - Security", line: "Keep an eye on bay 7. Something's off." },
    { speaker: "EarthSpacePort - Engineer", line: "Old warships still give me the chills." },
    { speaker: "EarthSpacePort - Pilot", line: "A Venus run beats this chaos any day." },
    { speaker: "EarthSpacePort - Load Chief", line: "No one's touched bay 12 in hours. Go check." }
  ],
  Pacific: [
    { speaker: "Pacific - Researcher", line: "Another reading spike. That can't be good..." },
    { speaker: "Pacific - AI Assistant", line: "Reminder: hydration is optimal for humans." },
    { speaker: "Pacific - Archivist", line: "I swear one of the artifacts moved." },
    { speaker: "Pacific - Diver", line: "I saw light beneath grid 3. Unnatural light." },
    { speaker: "Pacific - Communications", line: "Relay's been glitching all morning. Again." }
  ],

  // === Mars ===
  ColonyCore: [
    { speaker: "ColonyCore - Botanist", line: "The trees are taking root. Finally." },
    { speaker: "ColonyCore - Historian", line: "We almost lost this city. Almost." },
    { speaker: "ColonyCore - Vendor", line: "Fresh synthfruit! Get it while it glows!" },
    { speaker: "ColonyCore - Child", line: "Are the stars different from Mars?" },
    { speaker: "ColonyCore - Guard", line: "Routine scans. Don’t make this weird." }
  ],
  TerraformingFields: [
    { speaker: "Fields - DroneOperator", line: "Unit 42 stopped responding near the ridge." },
    { speaker: "Fields - Terraformer", line: "Wind’s picking up. Sandstorm incoming, maybe." },
    { speaker: "Fields - Mechanic", line: "Pump systems are jammed. Again." },
    { speaker: "Fields - Supervisor", line: "Check the eastern dome’s pressure seal." },
    { speaker: "Fields - Biologist", line: "Soil sample B-17 is reacting... strangely." }
  ],
  AncientVault: [
    { speaker: "Vault - Archeologist", line: "These symbols repeat every 88 meters." },
    { speaker: "Vault - Linguist", line: "No match in any known dialect. Not even close." },
    { speaker: "Vault - Archivist", line: "Kilko resonance patterns are increasing." },
    { speaker: "Vault - Guard", line: "You hear that hum? It’s louder near the wall." },
    { speaker: "Vault - Explorer", line: "Whatever this place is, it's *not* dead." }
  ],

  // === Europa ===
  ResearchBase: [
    { speaker: "ResearchBase - Scientist", line: "Cracks in the ice are forming faster now." },
    { speaker: "ResearchBase - Analyst", line: "Another drone went silent beneath layer 4." },
    { speaker: "ResearchBase - Engineer", line: "Pressure's spiking in the lower tunnels." },
    { speaker: "ResearchBase - Medic", line: "Radiation exposure checks are due. Again." },
    { speaker: "ResearchBase - Geologist", line: "There’s movement under the crust. Again." }
  ],
  GroundCamp: [
    { speaker: "GroundCamp - Lead", line: "Keep your boots sealed — it’s colder than usual." },
    { speaker: "GroundCamp - Guard", line: "Ice wolves spotted on the south ridge." },
    { speaker: "GroundCamp - Surveyor", line: "We've got a partial reading from Node Delta." },
    { speaker: "GroundCamp - Cook", line: "Who left the heat dome open last night?" },
    { speaker: "GroundCamp - Rookie", line: "I swear the ice just... breathed." }
  ],
  Ruins: [
    { speaker: "Ruins - DroneOp", line: "Two more scouts lost signal in the main shaft." },
    { speaker: "Ruins - Archeologist", line: "There’s geometry here that shouldn’t exist." },
    { speaker: "Ruins - Signal Tech", line: "Frequency drift again. That’s the third time." },
    { speaker: "Ruins - Commander", line: "No one goes deeper than sector 6. Orders." },
    { speaker: "Ruins - Echo Analyst", line: "The walls are *responding* to us..." }
  ],

  // === Jupiter ===
  StormObservatory: [
    { speaker: "Observatory - Scientist", line: "The red storm’s pulse is intensifying again." },
    { speaker: "Observatory - Sensor Tech", line: "Telescopes realigned to track the outer vortex." },
    { speaker: "Observatory - Engineer", line: "We lost another stabilizer. Swell." },
    { speaker: "Observatory - Navigator", line: "Station drift is within margin. Barely." },
    { speaker: "Observatory - Commander", line: "Prepare fallback orbit in case of breach." }
  ],
  GasHarvester: [
    { speaker: "Harvester - Operator", line: "Hydrogen levels are peaking. Cut intake 12%" },
    { speaker: "Harvester - Technician", line: "Someone needs to grease the extractor arms." },
    { speaker: "Harvester - Pilot", line: "Watch for turbulence. Jupiter’s cranky today." },
    { speaker: "Harvester - Chemist", line: "We may have found trace organics..." },
    { speaker: "Harvester - Commander", line: "Prep for emergency cutoff. Always prep." }
  ],
  ResearchArray: [
    { speaker: "Array - Drone AI", line: "Node connection stable. No anomalies." },
    { speaker: "Array - Data Analyst", line: "The magnetic shift pattern is repeating." },
    { speaker: "Array - Admin", line: "Command uplink active. Relay is clear." },
    { speaker: "Array - Operator", line: "Sensor 19 is acting up again. Replace it." },
    { speaker: "Array - Monitor", line: "Telemetry from Saturn just went dark." }
  ],
  CoreRelay: [
    { speaker: "CoreRelay - Relay Tech", line: "Signal lag is under 12ms. Not bad." },
    { speaker: "CoreRelay - Comms Officer", line: "Keep relay frequency clear. Priority only." },
    { speaker: "CoreRelay - Engineer", line: "That relay beam just blinked. It’s not supposed to." },
    { speaker: "CoreRelay - Watch", line: "Atmospheric pressure’s climbing fast. Again." },
    { speaker: "CoreRelay - Officer", line: "We’re close to the breach zone. Stay sharp." }
  ],
  ExcavationPlatforms: [
    { speaker: "Excavator - Lead", line: "Platform 3 is vibrating again." },
    { speaker: "Excavator - Tech", line: "That artifact is glowing. Again." },
    { speaker: "Excavator - Diver", line: "I saw something move in the gas." },
    { speaker: "Excavator - Commander", line: "Keep scans tight. No slip-ups." },
    { speaker: "Excavator - Crew", line: "Who left the gravity dampeners off?" }
  ],

  // === Vega ===
  CapitalCity: [
    { speaker: "CapitalCity - Resident", line: "The neon's brighter than usual." },
    { speaker: "CapitalCity - Vendor", line: "Get your bio-glass earrings! Freshly etched!" },
    { speaker: "CapitalCity - Runner", line: "Delivery bots are delayed. Manual runs it is." },
    { speaker: "CapitalCity - Security", line: "No entry without Vega ID clearance." },
    { speaker: "CapitalCity - Tourist", line: "Is that a real star fragment?" }
  ],
  OrbitalTradeRing: [
    { speaker: "TradeRing - Trader", line: "Cargo’s cleared customs. Finally." },
    { speaker: "TradeRing - Officer", line: "We intercepted a smuggler with Kilko tech." },
    { speaker: "TradeRing - Drone Pilot", line: "Trade pod 7 just spun out. Recovering." },
    { speaker: "TradeRing - Customs", line: "You need three forms for that? Ridiculous." },
    { speaker: "TradeRing - Announcer", line: "Attention: minor delay in sector 4 shipping lanes." }
  ],
  StellarObservationSpire: [
    { speaker: "Spire - Astronomer", line: "Another anomaly blinked at 5 AU." },
    { speaker: "Spire - Analyst", line: "We caught a flare echo. From *outside*." },
    { speaker: "Spire - Systems", line: "Array aligned. Holding stable." },
    { speaker: "Spire - Observer", line: "The Kilko field’s visible again. Barely." },
    { speaker: "Spire - Technician", line: "Sensor 3B needs realignment." }
  ],
  CrystalCanyonOutpost: [
    { speaker: "Canyon - Miner", line: "Drill's stuck. Again." },
    { speaker: "Canyon - Geologist", line: "These crystals resonate when we speak." },
    { speaker: "Canyon - Surveyor", line: "We mapped another chamber today." },
    { speaker: "Canyon - Medic", line: "Hydration levels low in Zone Delta." },
    { speaker: "Canyon - AI", line: "Caution: seismic tremors detected nearby." }
  ],

  // === Andromeda ===
  ForwardRecon: [
    { speaker: "Recon - Operator", line: "Signal spike. Something’s out there." },
    { speaker: "Recon - Drone AI", line: "Scans incomplete. Retry in 3 minutes." },
    { speaker: "Recon - Watcher", line: "The void feels... different today." },
    { speaker: "Recon - Lead", line: "Automated beacon failure on channel 8." },
    { speaker: "Recon - Guard", line: "Secure the station perimeter. Again." }
  ],
  BlackSpire: [
    { speaker: "BlackSpire - Technician", line: "Echo packets doubled in the last hour." },
    { speaker: "BlackSpire - Watcher", line: "We’re still relaying signals from Sol." },
    { speaker: "BlackSpire - Guard", line: "I swear the asteroid moved. Just a little." },
    { speaker: "BlackSpire - Engineer", line: "Relay 9 is glowing. That’s not normal." },
    { speaker: "BlackSpire - Archivist", line: "We logged a pulse from Andromeda’s edge." }
  ],
  XenoArchives: [
    { speaker: "XenoArchives - Linguist", line: "Translation halted. Symbols just... shifted." },
    { speaker: "XenoArchives - Curator", line: "No touching the containment field. Again." },
    { speaker: "XenoArchives - Researcher", line: "This relic’s emitting a new frequency." },
    { speaker: "XenoArchives - AI", line: "Unknown language pattern forming. Tracking..." },
    { speaker: "XenoArchives - Historian", line: "That statue wasn't facing that way yesterday." }
  ]
};

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
      "Nova: Next stop, the void between places."
    ],
    arrival: [
      "Nova: Arrival confirmed. No hull breaches detected.",
      "Nova: Welcome. Conditions seem... breathable.",
      "Nova: Surface scans are returning anomalies. Intriguing.",
      "Nova: I suggest keeping your helmet on.",
      "Nova: We've arrived. Try not to break anything, Captain."
    ],
    idle: [
      "Nova: Systems green. Do you require anything, Captain?",
      "Nova: Monitoring sensors. Silence is... eerie.",
      "Nova: No threats detected. For now.",
      "Nova: If you're contemplating, I recommend the Vega view.",
      "Nova: I’ve re-calibrated your neural quiet mode. You're welcome."
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
  NovaAI.speak("travel"); // Add this
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  setTimeout(() => {
    appendLog(`System: Zero-point travel finished. Welcome to ${dest.name}.`);
    NovaAI.speak("arrival"); // Add this
    endTravel(dest.key, dest.key);
    NovaAI.startIdle(); // Add this
  }, 3000);
}

function travelToSubDestination(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak("travel"); // Add this
  const description = config.sectorDescriptions?.[dest.key];
  const travelType = dest.type || config.travelType || 'shuttle';

  const travelLabel = {
    drone: "Deploying drone",
    orbit: "Initiating orbital alignment",
    rover: "Boarding the rover",
    shuttle: "Boarding the shuttle",
    train: "Boarding the train"
  }[travelType] || "Traveling";

  appendLog(`System: ${travelLabel} to ${dest.name}...`);

  const delay = travelType === 'drone' ? 2000 : 3000;
  setTimeout(() => {
    appendLog(`System: Arrived at ${dest.name}.`);
    if (description) appendLog(description);
   maybeDiscoverLore(dest.key);
    NovaAI.speak("arrival"); // Add this
    endTravel(dest.key, currentHub);
    startAmbientDialogue(dest.key);
    NovaAI.startIdle(); // Add this
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
// Ambient Dialogue Logic
// =======================
function startAmbientDialogue(destKey) {
  clearInterval(ambientTimer);
  const messages = ambientDialogue[destKey];
  if (!messages || !messages.length) return;

  setTimeout(() => {
    if (currentLocation !== destKey) return;
    const { speaker, line } = getRandomMessage(messages);
    appendLog(`${speaker}: "${line}"`);
  }, 5000);

  ambientTimer = setInterval(() => {
    if (currentLocation !== destKey) {
      clearInterval(ambientTimer);
      return;
    }
    const { speaker, line } = getRandomMessage(messages);
    appendLog(`${speaker}: "${line}"`);
  }, AMBIENT_INTERVAL);
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
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
