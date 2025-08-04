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
let currentSubLocation = null; // Added for tracking sub-destinations
let ambientTimer = null;
const AMBIENT_INTERVAL = 30000;

const mainDestinations = [];
const destinationConfigs = {};

fetch("destinations.json")
  .then(res => {
    console.log("Fetch response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Raw destination data:", data);
    mainDestinations.push(...data.mainDestinations);
    Object.assign(destinationConfigs, data.destinationConfigs);
    console.log("Destination data loaded. Main destinations:", mainDestinations.length);
    console.log("Destination configs:", Object.keys(destinationConfigs));
  })
  .catch(err => {
    console.error("Failed to load destination data:", err);
    // Fallback: load hardcoded data if JSON file fails
    console.log("Loading fallback destination data...");
    loadFallbackDestinations();
  });

// =======================
// Ambient Dialogue Data
// =======================
const ambientDialogue = {};  // declare as empty object

// ✅ Load ambientDialogue from external JSON
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
// Fallback Data (in case JSON file fails to load)
// =======================
function loadFallbackDestinations() {
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
          { "name": "New York Sector", "key": "NewYork", "description": "A massive sprawling city rebuilt after the Kilko disaster." },
          { "name": "Earth Space Port", "key": "EarthSpacePort", "description": "A large cargo and civilian port." },
          { "name": "Pacific Research Facility", "key": "Pacific", "description": "A massive floating research base." }
        ]
      },
      "Mars": {
        "description": "Orbiting Mars Colony Alpha, a sprawling network of habitats.",
        "travelType": "shuttle",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Colony Core", "key": "ColonyCore", "description": "The heart of Martian habitation." },
          { "name": "Terraforming Fields", "key": "TerraformingFields", "description": "Sprawling atmosphere processors." },
          { "name": "Ancient Vault", "key": "AncientVault", "description": "Mysterious pre-human vault." }
        ]
      },
      "Jupiter": {
        "description": "Orbiting the Jupiter Orbital Station.",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Storm Observatory", "key": "StormObservatory", "description": "Observes Jupiter's massive storms." },
          { "name": "Gas Harvesting Platform", "key": "GasHarvester", "description": "Siphons valuable gases." }
        ]
      },
      "Europa": {
        "description": "Orbiting Europa Research Base.",
        "travelType": "rover",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Research Base", "key": "ResearchBase", "description": "Core base for studying Europa." },
          { "name": "Ground Camp", "key": "GroundCamp", "description": "Temporary field base." }
        ]
      },
      "Andromeda": {
        "description": "Orbiting the Andromeda Outpost.",
        "travelType": "shuttle",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Forward Recon Station", "key": "ForwardRecon", "description": "Unmanned outpost." },
          { "name": "Black Spire Relay", "key": "BlackSpire", "description": "Quantum signal relay." }
        ]
      },
      "Vega": {
        "description": "Orbiting Vega Prime, a vibrant star system hub.",
        "subDestinations": [
          { "name": "Return to Ship", "key": "Return" },
          { "name": "Capital City", "key": "CapitalCity", "description": "A neon metropolis and trade center." },
          { "name": "Orbital Trade Ring", "key": "OrbitalTradeRing", "description": "Ring-shaped station for trade." }
        ]
      }
    }
  };
  
  mainDestinations.push(...fallbackData.mainDestinations);
  Object.assign(destinationConfigs, fallbackData.destinationConfigs);
  console.log("Fallback data loaded successfully");
}
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

// ✅ Load Nova Dialogue from external JSON
fetch("novaDialogue.json")
  .then(res => res.json())
  .then(data => {
    NovaAI.dialogue = data;
    console.log("Nova dialogue loaded.");
  })
  .catch(err => {
    console.error("Failed to load novaDialogue.json:", err);
  });

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

// Helper function to find a destination by key in nested structure
function findDestinationByKey(key, destinations) {
  for (const dest of destinations) {
    if (dest.key === key) {
      return dest;
    }
    if (dest.subDestinations) {
      const found = findDestinationByKey(key, dest.subDestinations);
      if (found) return found;
    }
  }
  return null;
}

function handleDestinationClick(dest, btn) {
  if (traveling) return;

  const isReturn = dest.key === 'Return';
  const isMainDest = mainDestinations.some(d => d.key === dest.key);

  console.log(`Clicked: ${dest.name}, Key: ${dest.key}, Current Hub: ${currentHub}, Current Location: ${currentLocation}, Current Sub: ${currentSubLocation}`);

  if (isReturn) {
    handleReturnClick();
    return;
  }

  if (isMainDest && !currentHub) {
    travelToMainDestination(dest, btn);
    return;
  }

  if (currentHub) {
    const config = destinationConfigs[currentHub];
    
    // Check if it's a direct sub-destination of the hub
    const isDirectSub = config.subDestinations?.some(d => d.key === dest.key);
    
    if (isDirectSub) {
      travelToSubDestination(dest, btn, config);
      return;
    }

    // Check if it's a sub-sub-destination (third level)
    if (currentSubLocation) {
      const parentSub = findDestinationByKey(currentSubLocation, config.subDestinations);
      if (parentSub?.subDestinations?.some(d => d.key === dest.key)) {
        travelToSubSubDestination(dest, btn, parentSub);
        return;
      }
    }

    // Check if current location has sub-destinations to show
    const currentDest = findDestinationByKey(currentLocation, config.subDestinations);
    if (currentDest?.subDestinations?.some(d => d.key === dest.key)) {
      // This is navigating to a sub-destination's sub-destinations
      showSubDestinations(dest, currentDest);
      return;
    }
  }

  console.log("No matching handler found for destination:", dest);
}

function handleReturnClick() {
  if (currentSubLocation && currentSubLocation !== currentHub) {
    // Return from sub-sub-destination to sub-destination
    const config = destinationConfigs[currentHub];
    const parentSub = findDestinationByKey(currentSubLocation, config.subDestinations);
    if (parentSub) {
      currentLocation = currentSubLocation;
      createButtons(parentSub.subDestinations);
      appendLog(`System: Returning to ${parentSub.name}.`);
      currentSubLocation = null;
      return;
    }
  }
  
  if (currentLocation && currentLocation !== currentHub) {
    // Return from sub-destination to hub
    const config = destinationConfigs[currentHub];
    currentLocation = currentHub;
    currentSubLocation = null;
    createButtons(config.subDestinations);
    appendLog(`System: Returning to ${currentHub} sectors.`);
    return;
  }
  
  // Return to ship
  currentLocation = null;
  currentHub = null;
  currentSubLocation = null;
  clearInterval(ambientTimer);
  createButtons(mainDestinations);
  appendLog("System: Returning to ship. Please select a destination.");
}

function showSubDestinations(dest, parentDest) {
  // This handles showing the sub-destinations without "traveling"
  currentSubLocation = currentLocation;
  currentLocation = dest.key;
  createButtons(dest.subDestinations);
  appendLog(`System: Accessing ${dest.name}.`);
  if (dest.description) {
    appendLog(dest.description);
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
    
    const config = destinationConfigs[dest.key];
    createButtons(config.subDestinations);
    
    hideTravelOverlay();
    NovaAI.startIdle();
  }, 3000);
}

function travelToSubDestination(dest, btn, config) {
  beginTravel(btn);
  NovaAI.speak("travel");

  const description = dest.description || config.sectorDescriptions?.[dest.key];
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
    currentLocation = dest.key;
    currentSubLocation = null;

    if (dest.subDestinations) {
      createButtons(dest.subDestinations);
    } else {
      dest.subDestinations = generateDefaultSubDestinations(dest);
      createButtons(dest.subDestinations);
    }

    hideTravelOverlay();
    startAmbientDialogue(dest.key);
    NovaAI.startIdle();
    traveling = false;
  }, delay);
}

function travelToSubSubDestination(dest, btn, parentSub) {
  beginTravel(btn);
  NovaAI.speak("travel");
  showTravelOverlay(`Traveling deeper to ${dest.name}...`);
  appendLog(`System: Traveling deeper to ${dest.name}...`);

  setTimeout(() => {
    appendLog(`System: Arrived at ${dest.name}.`);
    if (dest.description) {
      appendLog(dest.description);
    }
    NovaAI.speak("arrival");
    currentLocation = dest.key;

    if (dest.subDestinations) {
      createButtons(dest.subDestinations);
    } else {
      dest.subDestinations = generateDefaultSubDestinations(dest);
      createButtons(dest.subDestinations);
    }

    hideTravelOverlay();
    NovaAI.startIdle();
    traveling = false;
  }, 2000);
}

function beginTravel(btn) {
  traveling = true;
  clearInterval(ambientTimer);
  NovaAI.stopIdle();
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
  }, 800);
}

function generateDefaultSubDestinations(dest) {
  return [
    { name: "Return to Previous", key: "Return" },
    { name: `${dest.name} Core Zone`, key: `${dest.key}_1` },
    { name: `${dest.name} Outer Sector`, key: `${dest.key}_2` }
  ];
}

// =======================
// Ambient Dialogue Logic
// =======================
function startAmbientDialogue(destKey) {
  clearInterval(ambientTimer);
  const messages = ambientDialogue[destKey];
  if (!messages?.length) return;

  setTimeout(() => {
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
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

// =======================
// Event Handlers
// =======================
window.addEventListener('DOMContentLoaded', () => {
  // Get elements again to ensure they exist
  const proceedBtn = document.getElementById('proceedBtn');
  const onBtn = document.getElementById('onBtn');
  
  console.log('DOM loaded, proceedBtn:', proceedBtn, 'onBtn:', onBtn); // Debug log

  if (proceedBtn) {
    proceedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Proceed button clicked'); // Debug log
      startupScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    });
  }

  if (onBtn) {
    onBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('ON button clicked'); // Debug log
      loginScreen.classList.add('hidden');
      travelScreen.classList.remove('hidden');
      appendLog("System: Welcome, Captain. Please select a destination.");

      // Wait until destinations are loaded
      console.log("Checking if destinations are loaded...", mainDestinations.length);
      if (mainDestinations.length > 0) {
        console.log("Creating buttons with destinations:", mainDestinations);
        createButtons(mainDestinations);
      } else {
        console.log("Waiting for destination data to load...");
        const waitForData = setInterval(() => {
          console.log("Still waiting... destinations count:", mainDestinations.length);
          if (mainDestinations.length > 0) {
            console.log("Destinations loaded! Creating buttons...");
            clearInterval(waitForData);
            createButtons(mainDestinations);
          }
        }, 100);
        
        // Timeout after 5 seconds and force load fallback data
        setTimeout(() => {
          if (mainDestinations.length === 0) {
            console.log("Timeout reached, forcing fallback data load");
            clearInterval(waitForData);
            loadFallbackDestinations();
            createButtons(mainDestinations);
          }
        }, 5000);
      }
    });
  } else {
    console.error('ON button not found!'); // Debug log
  }
});
