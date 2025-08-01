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
      NewYork: "A massive sprawling city, a far cry from the concrete jungle of old...",
      EarthSpacePort: "A large cargo and civilian port that once fueled the Red War...",
      Pacific: "A massive floating research base that studies artifacts from the Kilko disaster..."
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
      ColonyCore: "The beating heart of the terraforming effort...",
      TerraformingFields: "Engineers work here to make Mars habitable...",
      AncientVault: "An ancient vault emerged during the Kilko disaster..."
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
      ResearchBase: "A hub of scientific activity focused on Europa’s ice crust...",
      GroundCamp: "A rugged outpost supporting field teams...",
      Ruins: "A hidden megastructure buried under Europa's ice..."
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
      StormObservatory: "Observes Jupiter’s massive storms...",
      GasHarvester: "Harvests gases for fuel...",
      ResearchArray: "Sensor nodes study Jupiter's magnetic field...",
      CoreRelay: "Deep in the atmosphere, this hub maintains long-range communication...",
      ExcavationPlatforms: "Digs into Jupiter’s gas layers..."
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
      StellarObservationSpire: "Where the megastructures were first discovered.",
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
  NewYork: [
    { speaker: "NewYork - Technician", line: "Just patched another conduit. Third one this week." },
    { speaker: "NewYork - Trader", line: "Shipping lanes are still backed up. Blame the Torta storm." },
    { speaker: "NewYork - Civilian", line: "You ever wonder what’s *under* the megastructure?" }
  ],
  EarthSpacePort: [
    { speaker: "EarthSpacePort - Dockmaster", line: "Cargo bay 3 is sealed. Ready for next drop." },
    { speaker: "EarthSpacePort - Security", line: "Keep an eye on bay 7. Something's off." },
    { speaker: "EarthSpacePort - Engineer", line: "Old warships still give me the chills." }
  ],
  Pacific: [
    { speaker: "Pacific - Researcher", line: "Another reading spike. That can't be good..." },
    { speaker: "Pacific - AI Assistant", line: "Reminder: hydration is optimal for humans." },
    { speaker: "Pacific - Archivist", line: "I swear one of the artifacts moved." }
  ],
  ColonyCore: [
    { speaker: "ColonyCore - Botanist", line: "The trees are taking root. Finally." },
    { speaker: "ColonyCore - Historian", line: "We almost lost this city. Almost." },
    { speaker: "ColonyCore - Vendor", line: "Fresh synthfruit! Get it while it glows!" }
  ]
  // Add more locations as needed
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
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  setTimeout(() => {
    appendLog(`System: Zero-point travel finished. Welcome to ${dest.name}.`);
    endTravel(dest.key, dest.key);
  }, 3000);
}

function travelToSubDestination(dest, btn, config) {
  beginTravel(btn);
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
    endTravel(dest.key, currentHub);
    startAmbientDialogue(dest.key);
  }, delay);
}

function beginTravel(btn) {
  traveling = true;
  clearInterval(ambientTimer);
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
