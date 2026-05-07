// =======================
// DOM Elements
// =======================
const startupScreen = document.getElementById('startupScreen');
const loginScreen = document.getElementById('loginScreen');
const travelScreen = document.getElementById('travelScreen');
const destList = document.querySelector('.dest-list');
const logEl = document.getElementById('log');

// =======================
// State Variables
// =======================
let traveling = false;
let currentLocation = null;  // The specific sub-location key we are currently at
let currentHub = null;        // The main destination key (Earth, Mars, etc.)
let currentSubLocation = null; // Parent key when at a level-3 (sub-sub) destination
let ambientTimer = null;
const AMBIENT_INTERVAL = 30000;

const mainDestinations = [];
const destinationConfigs = {};

// Track whether destinations have been loaded to avoid double createButtons calls
let destinationsLoaded = false;
let pendingCreateButtons = false;

fetch("destinations.json")
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    mainDestinations.push(...data.mainDestinations);
    Object.assign(destinationConfigs, data.destinationConfigs);
    destinationsLoaded = true;
    console.log("Destination data loaded:", mainDestinations.length, "destinations");
    // If the ON button was already pressed while we were loading, create buttons now
    if (pendingCreateButtons) {
      pendingCreateButtons = false;
      createButtons(mainDestinations);
    }
  })
  .catch(err => {
    console.error("Failed to load destination data:", err);
    loadFallbackDestinations();
    destinationsLoaded = true;
    if (pendingCreateButtons) {
      pendingCreateButtons = false;
      createButtons(mainDestinations);
    }
  });

// =======================
// Ambient Dialogue Data
// =======================
const ambientDialogue = {};

fetch("ambientDialogue.json")
  .then(res => res.json())
  .then(data => {
    Object.assign(ambientDialogue, data);
    console.log("Ambient dialogue loaded.");
  })
  .catch(err => {
    console.error("Failed to load ambientDialogue.json:", err);
  });

// =======================
// Fallback Data
// =======================
function loadFallbackDestinations() {
  console.log("Loading fallback destination data...");
  const fallbackData = {
    "mainDestinations": [
      { "name": "Earth", "key": "Earth" },
      { "name": "Mars Colony Alpha", "key": "Mars" },
      { "name": "Jupiter Orbital Station", "key": "Jupiter" },
      { "name": "Europa Research Base", "key": "Europa" },
      { "name": "Andromeda Outpost", "key": "Andromeda" },
      { "name": "Vega Prime", "key": "Vega" }
    ],
    "destinationConfigs": {
      "Earth": {
        "description": "Orbiting Earth, the fractured home of humanity.",
        "travelType": "train",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "New York Sector", "key": "NewYork", "description": "A massive sprawling city rebuilt after the Kilko disaster.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Downtown Core", "key": "NewYork_Downtown", "description": "The center of the rebuilt New York." },
              { "name": "Torta Excavation Site", "key": "NewYork_Torta", "description": "Ongoing digs into ancient megastructure debris." },
              { "name": "Skyline Transit Nexus", "key": "NewYork_Transit", "description": "A massive floating station for vertical transit." }
            ]
          },
          { "name": "Earth Space Port", "key": "EarthSpacePort", "description": "A large cargo and civilian port.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Processing", "key": "EarthSpacePort_FrontDesk", "description": "Entry zone for civilian and cargo inspection." },
              { "name": "Cargo Intake", "key": "EarthSpacePort_Cargo", "description": "Freight and military shipments arrive here." },
              { "name": "Docking Bay", "key": "EarthSpacePort_Docking", "description": "Where ships refuel, dock, and load passengers." }
            ]
          },
          { "name": "Pacific Research Facility", "key": "Pacific", "description": "A massive floating research base.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Kilko Artifact Lab", "key": "Pacific_ArtifactLab", "description": "Secure containment and analysis facility." },
              { "name": "Deep Sea Observatory", "key": "Pacific_Observatory", "description": "Submersible launch bay and monitoring station." },
              { "name": "Abyssal Research Wing", "key": "Pacific_Abyssal", "description": "Pressurized labs studying deep ocean trenches." }
            ]
          }
        ]
      },
      "Mars": {
        "description": "Orbiting Mars Colony Alpha, a sprawling network of habitats.",
        "travelType": "shuttle",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Colony Core", "key": "ColonyCore", "description": "The heart of Martian habitation.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Residential Dome", "key": "ColonyCore_Residential", "description": "Living quarters for colonists." },
              { "name": "Central Market", "key": "ColonyCore_Market", "description": "Bustling commercial hub." },
              { "name": "Power Hub", "key": "ColonyCore_Power", "description": "Power station for life support." }
            ]
          },
          { "name": "Terraforming Fields", "key": "TerraformingFields", "description": "Sprawling atmosphere processors.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Ancient Vault", "key": "AncientVault", "description": "Mysterious pre-human vault.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          }
        ]
      },
      "Jupiter": {
        "description": "Orbiting the Jupiter Orbital Station.",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Storm Observatory", "key": "StormObservatory", "description": "Observes Jupiter's massive storms.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Sensor Array", "key": "StormObservatory_Sensors", "description": "Measures electromagnetic fields from storms." },
              { "name": "Atmospheric Lab", "key": "StormObservatory_Lab", "description": "Researchers studying Jupiter's weather." }
            ]
          },
          { "name": "Gas Harvesting Platform", "key": "GasHarvester", "description": "Siphons valuable gases.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Research Array", "key": "ResearchArray", "description": "Drone-controlled scientific sensors.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Deep Core Relay", "key": "CoreRelay", "description": "Communications hub in Jupiter's atmosphere.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Excavation Platforms", "key": "ExcavationPlatforms", "description": "Structures digging into ancient rings.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          }
        ]
      },
      "Europa": {
        "description": "Orbiting Europa Research Base.",
        "travelType": "rover",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Research Base", "key": "ResearchBase", "description": "Core base for studying Europa.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Subsurface Tunnels", "key": "ResearchBase_Tunnels", "description": "Ancient tunnels beneath the ice." },
              { "name": "AI Lab", "key": "ResearchBase_Lab", "description": "Off-world AI behavior and containment." },
              { "name": "Core Chamber", "key": "ResearchBase_Core", "description": "A deep, partially flooded cavern." }
            ]
          },
          { "name": "Ground Camp", "key": "GroundCamp", "description": "Temporary field base.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Ruins", "key": "Ruins", "description": "Ancient megastructure under kilometers of ice.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          }
        ]
      },
      "Andromeda": {
        "description": "Orbiting the Andromeda Outpost.",
        "travelType": "shuttle",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Forward Recon Station", "key": "ForwardRecon", "description": "Unmanned outpost.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Black Spire Relay", "key": "BlackSpire", "description": "Quantum signal relay.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Xeno Archives", "key": "XenoArchives", "description": "Vault of alien artifacts.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Statue Research Wing", "key": "StatueWing", "description": "Chamber of alien statues.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          }
        ]
      },
      "Vega": {
        "description": "Orbiting Vega Prime, a vibrant star system hub.",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Capital City", "key": "CapitalCity", "description": "A neon metropolis and trade center.",
            "subDestinations": [
              { "name": "Return to Previous", "key": "Return" },
              { "name": "Tech District", "key": "CapitalCity_Tech", "description": "Startup hubs and AI incubation vaults." },
              { "name": "Underdeck Market", "key": "CapitalCity_Market", "description": "Black market hub for rare parts." },
              { "name": "Central Core", "key": "CapitalCity_Core", "description": "Central processors and energy grid." }
            ]
          },
          { "name": "Orbital Trade Ring", "key": "OrbitalTradeRing", "description": "Ring-shaped station for trade.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Stellar Observation Spire", "key": "StellarObservationSpire", "description": "First to detect the incoming megastructures.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          },
          { "name": "Crystal Canyon Outpost", "key": "CrystalCanyonOutpost", "description": "Gem mines rumored to house alien tech.",
            "subDestinations": [{ "name": "Return to Previous", "key": "Return" }]
          }
        ]
      }
    }
  };

  mainDestinations.push(...fallbackData.mainDestinations);
  Object.assign(destinationConfigs, fallbackData.destinationConfigs);
  console.log("Fallback data loaded successfully");
}

// =======================
// Log Helper
// =======================
function appendLog(text) {
  const line = document.createElement('div');
  // Trim leading/trailing whitespace to avoid pre-wrap indentation artifacts
  line.textContent = text.trim();
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

// =======================
// Nova AI System
// =======================
const NovaAI = {
  dialogue: {},

  speak(category) {
    const lines = this.dialogue[category];
    if (!lines?.length) return;
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

fetch("novaDialogue.json")
  .then(res => res.json())
  .then(data => {
    NovaAI.dialogue = data;
    console.log("Nova dialogue loaded.");
  })
  .catch(err => {
    console.error("Failed to load novaDialogue.json:", err);
  });

// =======================
// Button Helpers
// =======================
function clearDestinations() {
  if (destList) {
    destList.innerHTML = '<h2>Select Destination</h2>';
  }
}

function enableButtons() {
  destList.querySelectorAll('button').forEach(btn => btn.disabled = false);
}

function createButtons(destinations) {
  if (!destList) {
    console.error("destList element not found.");
    return;
  }
  if (!destinations || destinations.length === 0) {
    console.error("No destinations provided to createButtons.");
    return;
  }

  clearDestinations();

  destinations.forEach(dest => {
    const btn = document.createElement('button');
    btn.textContent = dest.name;
    btn.dataset.dest = dest.key;
    destList.appendChild(btn);
    btn.addEventListener('click', () => handleDestinationClick(dest, btn));
  });
}

// =======================
// Navigation Helpers
// =======================

// Recursively search for a destination by key within a list
function findDestinationByKey(key, destinations) {
  if (!destinations) return null;
  for (const dest of destinations) {
    if (dest.key === key) return dest;
    if (dest.subDestinations) {
      const found = findDestinationByKey(key, dest.subDestinations);
      if (found) return found;
    }
  }
  return null;
}

// =======================
// Click Handler (router)
// =======================
function handleDestinationClick(dest, btn) {
  if (traveling) return;

  if (dest.key === 'Return') {
    handleReturnClick();
    return;
  }

  const isMainDest = mainDestinations.some(d => d.key === dest.key);

  // Level 1 -> Level 2: traveling to a main destination from ship
  if (isMainDest && !currentHub) {
    travelToMainDestination(dest, btn);
    return;
  }

  if (currentHub) {
    const config = destinationConfigs[currentHub];

    // Level 2 -> Level 3: clicking a direct sub-destination of the hub
    const isDirectSub = config.subDestinations?.some(d => d.key === dest.key);
    if (isDirectSub) {
      travelToSubDestination(dest, btn, config);
      return;
    }

    // Level 3 -> Level 4: clicking a sub-destination of a level-2 location
    if (currentLocation) {
      const parentDest = findDestinationByKey(currentLocation, config.subDestinations);
      if (parentDest?.subDestinations?.some(d => d.key === dest.key)) {
        travelToSubSubDestination(dest, btn, parentDest);
        return;
      }
    }
  }

  console.warn("No matching handler for destination:", dest);
}

// =======================
// Return Logic
// =======================
function handleReturnClick() {
  clearInterval(ambientTimer);
  NovaAI.stopIdle();

  // At level 3 (sub-sub): return to level 2 (sub-destination)
  if (currentSubLocation) {
    const config = destinationConfigs[currentHub];
    const parentDest = findDestinationByKey(currentSubLocation, config.subDestinations);
    if (parentDest?.subDestinations) {
      appendLog(`System: Returning to ${parentDest.name}.`);
      currentLocation = currentSubLocation;
      currentSubLocation = null;
      createButtons(parentDest.subDestinations);
      startAmbientDialogue(currentLocation);
      NovaAI.startIdle();
      return;
    }
  }

  // At level 2 (sub-destination): return to hub level
  if (currentLocation && currentLocation !== currentHub) {
    const config = destinationConfigs[currentHub];
    appendLog(`System: Returning to ${currentHub} sectors.`);
    currentLocation = currentHub;
    currentSubLocation = null;
    createButtons(config.subDestinations);
    NovaAI.startIdle();
    return;
  }

  // At hub level: return to ship / main destination list
  appendLog("System: Returning to ship. Please select a destination.");
  currentLocation = null;
  currentHub = null;
  currentSubLocation = null;
  createButtons(mainDestinations);
}

// =======================
// Travel Functions
// =======================

// Shared travel start: disables buttons, stops idle/ambient
function beginTravel(btn) {
  traveling = true;
  clearInterval(ambientTimer);
  NovaAI.stopIdle();
  destList.querySelectorAll('button').forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
  });
  if (btn) btn.classList.add('selected');
}

// Shared travel end: sets state and re-enables buttons
// FIX: endTravel now used consistently across all travel functions
function endTravel(newLocation, hubKey, parentSubKey = null) {
  currentLocation = newLocation;
  currentHub = hubKey;
  currentSubLocation = parentSubKey;
  traveling = false;
  enableButtons();
}

// Level 1 -> 2: zero-point jump to a main destination
function travelToMainDestination(dest, btn) {
  beginTravel(btn);
  NovaAI.speak("travel");
  appendLog(`System: Initiating zero-point travel to ${dest.name}...`);
  showTravelOverlay(`Engaging transit to ${dest.name}...`);

  setTimeout(() => {
    hideTravelOverlay();
    appendLog(`System: Zero-point travel complete. Welcome to ${dest.name}.`);
    NovaAI.speak("arrival");

    const config = destinationConfigs[dest.key];
    if (config?.description) appendLog(config.description);

    endTravel(dest.key, dest.key, null);
    createButtons(config.subDestinations);
    NovaAI.startIdle();
  }, 3000);
}

// Level 2 -> 3: local travel (train/shuttle/rover) to a sub-destination
function travelToSubDestination(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak("travel");

  const travelType = dest.travelType || config.travelType || 'shuttle';
  const travelLabel = {
    drone:   "Deploying drone",
    orbit:   "Initiating orbital alignment",
    rover:   "Boarding the rover",
    shuttle: "Boarding the shuttle",
    train:   "Boarding the train"
  }[travelType] || "Traveling";

  appendLog(`System: ${travelLabel} to ${dest.name}...`);
  showTravelOverlay(`${travelLabel} to ${dest.name}...`);

  const delay = travelType === 'drone' ? 2000 : 3000;

  setTimeout(() => {
    hideTravelOverlay();
    appendLog(`System: Arrived at ${dest.name}.`);
    if (dest.description) appendLog(dest.description);
    NovaAI.speak("arrival");

    // FIX: use endTravel consistently; currentSubLocation stays null at level 2
    endTravel(dest.key, currentHub, null);

    const subDests = dest.subDestinations || generateDefaultSubDestinations(dest);
    if (!dest.subDestinations) dest.subDestinations = subDests;
    createButtons(subDests);

    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
  }, delay);
}

// Level 3 -> 4: traveling deeper into a sub-sub-destination
function travelToSubSubDestination(dest, btn, parentDest) {
  beginTravel(btn);
  NovaAI.speak("travel");
  appendLog(`System: Traveling deeper to ${dest.name}...`);
  showTravelOverlay(`Traveling deeper to ${dest.name}...`);

  setTimeout(() => {
    hideTravelOverlay();
    appendLog(`System: Arrived at ${dest.name}.`);
    if (dest.description) appendLog(dest.description);
    NovaAI.speak("arrival");

    // FIX: track parentDest.key as currentSubLocation so Return works correctly
    endTravel(dest.key, currentHub, parentDest.key);

    const subDests = dest.subDestinations || generateDefaultSubDestinations(dest);
    if (!dest.subDestinations) dest.subDestinations = subDests;
    createButtons(subDests);

    // FIX: ambient dialogue now also fires at level 3
    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
  }, 2000);
}

// =======================
// Travel Overlay
// =======================
function showTravelOverlay(message = "Engaging transit...") {
  const overlay = document.getElementById('travelOverlay');
  if (!overlay) return;
  overlay.textContent = message;
  overlay.classList.remove('hidden');
  // Small timeout lets the browser paint the element before fading in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('active'));
  });
}

function hideTravelOverlay() {
  const overlay = document.getElementById('travelOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => overlay.classList.add('hidden'), 800);
}

// =======================
// Default Sub-Destinations
// =======================
function generateDefaultSubDestinations(dest) {
  return [
    { name: "Return to Previous", key: "Return" },
    { name: `${dest.name} Core Zone`, key: `${dest.key}_1` },
    { name: `${dest.name} Outer Sector`, key: `${dest.key}_2` }
  ];
}

// =======================
// Ambient Dialogue
// =======================
function startAmbientDialogue(destKey) {
  clearInterval(ambientTimer);
  const messages = ambientDialogue[destKey];
  if (!messages?.length) return;

  // First message fires after a short delay so it doesn't overlap arrival text
  const firstTimer = setTimeout(() => {
    if (currentLocation !== destKey) return;
    const { speaker, line } = getRandomMessage(messages);
    appendLog(`${speaker}: "${line}"`);
  }, 8000);

  ambientTimer = setInterval(() => {
    if (currentLocation !== destKey) {
      clearInterval(ambientTimer);
      return;
    }
    const { speaker, line } = getRandomMessage(messages);
    appendLog(`${speaker}: "${line}"`);
  }, AMBIENT_INTERVAL);

  // Store firstTimer reference so we can cancel it if the player leaves early
  ambientTimer._firstTimer = firstTimer;
}

// Extend clearInterval to also cancel the first-message timeout
const _origClearInterval = clearInterval.bind(window);
function clearAmbientTimer() {
  if (ambientTimer) {
    if (ambientTimer._firstTimer !== undefined) {
      clearTimeout(ambientTimer._firstTimer);
    }
    _origClearInterval(ambientTimer);
    ambientTimer = null;
  }
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// =======================
// Event Handlers
// =======================
window.addEventListener('DOMContentLoaded', () => {
  const proceedBtn = document.getElementById('proceedBtn');
  const onBtn = document.getElementById('onBtn');

  if (proceedBtn) {
    proceedBtn.addEventListener('click', e => {
      e.preventDefault();
      startupScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    });
  }

  if (onBtn) {
    onBtn.addEventListener('click', e => {
      e.preventDefault();
      loginScreen.classList.add('hidden');
      travelScreen.classList.remove('hidden');
      appendLog("System: Welcome, Captain. Please select a destination.");

      // FIX: single-path loading — no polling loop, no race condition
      // If data is already loaded, create buttons immediately.
      // If not, set a flag so the fetch callback creates them when ready.
      if (destinationsLoaded) {
        createButtons(mainDestinations);
      } else {
        pendingCreateButtons = true;
        appendLog("System: Loading navigation data...");
      }
    });
  } else {
    console.error("ON button not found!");
  }
});
