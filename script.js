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
let currentHub = null; // NEW

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
      { name: "Colony Core", key: "ColonyCore" },
      { name: "Terraforming Fields", key: "TerraformingFields" },
      { name: "Ancient Vault", key: "AncientVault" },
    ],
    sectorDescriptions: {
      ColonyCore: "The beating heart of the terraforming effort, home to shops and homes. One of the few cities that survived the Kilko disaster.",
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
      ResearchBase: "A hub of scientific activity focused on Europa’s ice crust and subsurface ocean.",
      GroundCamp: "A rugged outpost supporting field teams. Built around an entrance to the megastructure.",
      Ruins: "A hidden megastructure buried under Europa's ice. It may predate all known civilizations."
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
      StormObservatory: "Observes Jupiter’s massive storms and protects orbital stations.",
      GasHarvester: "Harvests gases for fuel. Vital to outer colonies.",
      ResearchArray: "Sensor nodes study Jupiter's magnetic field.",
      CoreRelay: "Deep in the atmosphere, this hub maintains long-range communication.",
      ExcavationPlatforms: "Digs into Jupiter’s gas layers for ancient megastructure remnants."
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
      CapitalCity: "A neon metropolis untouched by the Kilko disaster.",
      OrbitalTradeRing: "Commerce and supply hub for Vega Prime.",
      StellarObservationSpire: "This is where the megastructures were first discovered.",
      CrystalCanyonOutpost: "Gem mines that power everything from ships to phones."
    }
  },
  Andromeda: {
    description: "Orbiting the Andromeda Outpost, a forward base for deep space exploration.",
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

  const config = destinationConfigs[currentHub] || destinationConfigs[dest.key];
  const isReturn = dest.key === 'Return';
  const isMainDest = mainDestinations.some(d => d.key === dest.key);

  if (isReturn) {
    currentLocation = null;
    currentHub = null;
    createButtons(mainDestinations);
    appendLog("System: Returning to ship. Please select a destination.");
    return;
  }

  if (config?.subDestinations && currentHub === null) {
    currentHub = dest.key;
    currentLocation = dest.key;
    appendLog(`System: ${config.description}`);
    createButtons(config.subDestinations);
    appendLog(`System: Accessing ${dest.name} sectors.`);
    return;
  }

  if (currentHub && config?.subDestinations?.some(d => d.key === dest.key)) {
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
    endTravel(dest.key, currentHub); // keep hub context
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

function endTravel(newLocation, hubKey) {
  currentLocation = newLocation;
  currentHub = hubKey;
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
