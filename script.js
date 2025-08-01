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
    description: "Orbiting Earth, the fractured home of humanity...",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "New York Sector", key: "NewYork" },
      { name: "Earth Space Port", key: "EarthSpacePort" },
      { name: "Pacific Research Facility", key: "Pacific" },
    ],
    travelType: "train",
    sectorDescriptions: {
      NewYork: "A massive sprawling city...",
      EarthSpacePort: "A medium sized structure space port...",
      Pacific: "This massive floating research base..."
    }
  },
  Mars: {
    description: "Orbiting Mars Colony Alpha...",
    subDestinations: [
      { name: "Return to Ship", key: "Return" },
      { name: "Terraforming Fields", key: "TerraformingFields" },
      { name: "Ancient Vault", key: "AncientVault" },
    ],
    travelType: "shuttle",
    sectorDescriptions: {
      TerraformingFields: "The Terraforming Fields are vast areas...",
      AncientVault: "An ancient vault carved deep into Martian rock..."
    }
  },
  // Add Europa, Jupiter, Vega, Andromeda following the same pattern...
};

// Flatten all subdestination keys for quick validation
const getAllSubKeys = () =>
  Object.values(destinationConfigs).flatMap(cfg => cfg.subDestinations?.map(d => d.key) || []);

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

  // Return to main
  if (isReturn) {
    currentLocation = null;
    createButtons(mainDestinations);
    appendLog("System: Returning to ship. Please select a destination.");
    return;
  }

  // Entering a main hub
  if (config?.subDestinations && currentLocation === null) {
    currentLocation = dest.key;
    appendLog(`System: ${config.description}`);
    createButtons(config.subDestinations);
    appendLog(`System: Accessing ${dest.name} sectors.`);
    return;
  }

  // Sub-destination travel
  if (currentLocation && config?.subDestinations?.some(d => d.key === dest.key)) {
    travelToSubDestination(dest, btn, config);
    return;
  }

  // Zero-point travel to main destination (no sub-menu)
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
  const travelLabel = travelType === 'drone' ? 'Deploying drone' :
                      travelType === 'orbit' ? 'Initiating orbital alignment' :
                      `Boarding the ${travelType}`;

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

