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
    description: "Orbiting Earth, the fractured home of humanity. The once-beautiful world lies in ruins due to the Kilko disaster...",
    travelType: "train",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "New York Sector", key: "NewYork" },
      { name: "Earth Space Port", key: "EarthSpacePort" },
      { name: "Pacific Research Facility", key: "Pacific" },
    ],
    sectorDescriptions: {
      NewYork: "A massive sprawling city, a far cry from the concrete jungle of old. Its proximity to the Torta structures fuels its economy.",
      EarthSpacePort: "A large cargo and civilian port that once fueled the Red War. Now a gateway for imports to Earth's mega cities.",
      Pacific: "A massive floating research base that studies artifacts from the Kilko disaster and other megastructures across the system."
    }
  },
  Mars: {
    description: "Orbiting Mars Colony Alpha, a sprawling network of habitats and terraforming stations.",
    travelType: "shuttle",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Colony Core", key:"ColonyCore" },
      { name: "Terraforming Fields", key: "TerraformingFields" },
      { name: "Ancient Vault", key: "AncientVault" },
    ],
    sectorDescriptions: {
      ColonuCore: "The beating heart of the terrafomring effort, its home to many many shops and homes its basically a giant underground city and one of the few that survived the kilko diaster and the mega structure that turned mars red again",
      TerraformingFields: "Engineers work here to make Mars habitable. Machinery hums endlessly, reshaping the planet.",
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
      ResearchBase: "A hub of scientific activity focused on Europa’s ice crust and subsurface ocean, while it studies the local ecosystem of europa it mostly studies the mega strcture beneath the ice",
      GroundCamp: "A rugged outpost supporting field teams on Europa's frozen surface. Weather makes it treacherous and dangerous at the best of times, it's built around an entrance to the mega strcture",
      Ruins: "A hidden megastructure buried under Europa's ice. It may predate all known civilizations, it is in reality, the entire moon of europa, the mega structure is merely frozen over, humanity continues to try and gain entrance."
    }
  },
  Jupiter: {
    description: "Orbiting the Jupiter Orbital Station, home to massive energy collectors and system logistics control.",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Storm Observatory", key: "StormObservatory", type: "shuttle" },
      { name: "Gas Harvesting Platform", key: "GasHarvester", type: "shuttle" },
      { name: "Research Array", key: "ResearchArray", type: "drone" },
      { name: "Deep Core Relay", key: "CoreRelay", type: "shuttle" },
      { name: "Excavation Platforms", key: "ExcavationPlatforms", type: "shuttle" },
    ],
    sectorDescriptions: {
      StormObservatory: "Observes Jupiter’s massive storms from a floating observatory high in the atmosphere, it adjusts the many inhabited stations to avoid the worst of the storms",
      GasHarvester: "Harvests gases for energy across the solar system. Essential for fueling outer colonies.",
      ResearchArray: "Deployed sensor nodes study Jupiter’s magnetic field and particle activity.",
      CoreRelay: "A relay hub sunk into Jupiter’s atmosphere, stabilizing communications for deep space.",
      ExcavationPlatforms: "Mining platforms explore the gas layers for signs of ancient megastructures."
    }
  },
  Vega: {
    description: "Orbiting Vega Prime, a vibrant star system hub with bustling orbital trade rings.",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Capital City", key: "CapitalCity", type: "shuttle" },
      { name: "Orbital Trade Ring", key: "OrbitalTradeRing", type: "orbit" },
      { name: "Stellar Observation Spire", key: "StellarObservationSpire", type: "orbit" },
      { name: "Crystal Canyon Outpost", key: "CrystalCanyonOutpost", type: "shuttle" },
    ],
    sectorDescriptions: {
      CapitalCity: "A neon-lit metropolis on Vega Prime. One of the few places untouched by the Kilko disaster.",
      OrbitalTradeRing: "A massive commercial hub that facilitates interstellar trade and commerce.",
      StellarObservationSpire: "An observation tower that first detected the megastructures in the Sol system.",
      CrystalCanyonOutpost: "A mining colony in crystal canyons. Vital for extracting rare minerals for technology."
    }
  },
  Andromeda: {
    description: "Orbiting the Andromeda Outpost, a forward base for deep space exploration beyond the solar system, its the closetest the andromada intitive ever got to andromada",
    travelType: "shuttle",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Forward Recon Station", key: "ForwardRecon", type: "drone" },
      { name: "Black Spire Relay", key: "BlackSpire" },
      { name: "Xeno Archives", key: "XenoArchives", type: "shuttle" },
    ],
    sectorDescriptions: {
      ForwardRecon: "An automated station monitoring deep space anomalies and potential threats beyond known systems.",
      BlackSpire: "A dark communications relay built into a jagged asteroid. It relays messages across galaxies.",
      XenoArchives: "A secure vault of ancient alien texts, relics, and data acquired from across the void."
    }
  }
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

  const config = destinationConfigs[currentLocation] || destinationConfigs[dest.key];
  const isReturn = dest.key === 'Return';
  const isMainDest = mainDestinations.some(d => d.key === dest.key);

  if (isReturn) {
    currentLocation = null;
    createButtons(mainDestinations);
    appendLog("System: Returning to ship. Please select a destination.");
    return;
  }

  if (config?.subDestinations && currentLocation === null) {
    currentLocation = dest.key;
    appendLog(`System: ${config.description}`);
    createButtons(config.subDestinations);
    appendLog(`System: Accessing ${dest.name} sectors.`);
    return;
  }

  if (currentLocation && config?.subDestinations?.some(d => d.key === dest.key)) {
    travelToSubDestination(dest, btn, config);
    return;
  }

  if (isMainDest) {
    travelToMainDestination(dest, btn);
    return;
  }
}

function travelToMainDestination(dest, btn) {
  beginTravel(btn);
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  setTimeout(() => {
    appendLog(`System: Zero-point travel finished. Welcome to ${dest.name}.`);
    endTravel(dest.key);
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
    endTravel(dest.key);
  }, delay);
}

function beginTravel(btn) {
  traveling = true;
  destList.querySelectorAll('button').forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
}

function endTravel(newLocation) {
  currentLocation = newLocation;
  traveling = false;
  enableButtons();
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
