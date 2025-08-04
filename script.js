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

const mainDestinations = [];
const destinationConfigs = {};

fetch("destinations.json")
  .then(res => res.json())
  .then(data => {
    mainDestinations.push(...data.mainDestinations);
    Object.assign(destinationConfigs, data.destinationConfigs);
    console.log("Destination data loaded.");
  })
  .catch(err => console.error("Failed to load destination data:", err));




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
      "Nova: Ignore any impacts you hear, it's probably just an asteroid.",
      "Nova: Hull integrity holding at 100%, brace for arrival",
      "Nova: Did you know you could survive for up to 2 minutes in the vaccum of space? You'd lose consciousness after 15 seconds tho",
      "Nova: Zero-point travel is not entirely understood, we got it from the mega structures! Some had massive ship bays that had city sized ships inside!",
      "Nova: The torta structures are connected to the mega structures, its believed they visited earth when it was just rock, billions of years ago!",
      "Nova: Zero point travel is the only way to leave the sol system quickly, generation ships are simply unviable until we invent cryo stasis",
      "Nova: Fuel levels holding, this new zero point core is very efficent!"
    ],
      arrival: [
      "Nova: Arrival confirmed. No hull breaches detected.",
      "Nova: Welcome. Conditions seem... breathable.",
      "Nova: Surface scans are returning anomalies. Intriguing.",
      "Nova: I suggest keeping your helmet on.",
      "Nova: We've arrived. Try not to break anything, Captain.",
      "Nova: The stars are beautiful here at night",
      "Nova: Remember to take your pistol; thieves can't steal if they're not breathing!",
      "Nova: If you can, get me an AI body. I'm tired of being a disembodied ship voice.",
      "Nova: Amplifier is a joy to be around, you should stop by oregon when you can!",
      "Nova: Did you know I'm 36 years old? I was created when smart AI's became a thing!",
      "Nova: I can get us permits to visit the local mega structures if you want",
      "Nova: Would yous still like me if I was a cat or something?",
      "Nova: Void dragons are just the cutest mega creatures in space!",
      "Nova: Thankfully we're not broke so I can pay for the landing"
    ],
    idle: [
      "Nova: Systems green. Do you require anything, Captain?",
      "Nova: Monitoring sensors. Silence is... eerie.",
      "Nova: No threats detected. For now.",
      "Nova: If you're contemplating, I recommend the Vega view.",
      "Nova: I've re-calibrated your neural quiet mode. You're welcome.",
      "Nova: I don't like it when you get quiet. Do I need to phone a friend?",
      "Nova: Please tell me you're not experiencing PTSD, Captain. The last time was... unideal.",
      "Nova: I wish I had a body like that old video game character. Her name starts with a C?",
      "Nova: You know I'm not attached to the ship right? I could accompany you!",
      "Nova: I'm a disk in the main console, just unplug me and put me in your Datapad! I can come with you!",
      "Nova: I am sure there is nothing to stress over while out here in the void",
      "Nova: Remeber! There's always tomorrow"
    ]
  },

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
    if (currentLocation && currentLocation !== currentHub) {
      const config = destinationConfigs[currentHub];
      currentLocation = currentHub;
      createButtons(config.subDestinations);
      appendLog(`System: Returning to ${currentHub} sectors.`);
      return;
    } else {
      currentLocation = null;
      currentHub = null;
      clearInterval(ambientTimer);
      createButtons(mainDestinations);
      appendLog("System: Returning to ship. Please select a destination.");
      return;
    }
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

    const parentSub = config.subDestinations.find(d => d.key === currentLocation);
    if (parentSub?.subDestinations?.some(d => d.key === dest.key)) {
      travelToSubSubDestination(dest, btn, parentSub);
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
    currentLocation = dest.key;

    // If the destination is New York, define real nested sub-destinations
    if (dest.key === "NewYork") {
  dest.subDestinations = [
    { name: "Return to Previous", key: "Return" },
    { name: "Downtown Core", key: "NewYork_Downtown" },
    { name: "Torta Excavation Site", key: "NewYork_Torta" },
    { name: "Skyline Transit Nexus", key: "NewYork_Transit" }
  ];
} else if (dest.key === "EarthSpacePort") {
  dest.subDestinations = [
    { name: "Return to Previous", key: "Return" },
    { name: "Processing", key: "EarthSpacePort_FrontDesk" },
    { name: "Cargo Intake", key: "EarthSpacePort_Cargo" },
    { name: "Docking Bay", key: "EarthSpacePort_Docking" }
  ];
} else {
  // Otherwise use generic nested sectors
  dest.subDestinations = [
    { name: "Return to Previous", key: "Return" },
    { name: `${dest.name} Subsector A`, key: `${dest.key}_A` },
    { name: `${dest.name} Subsector B`, key: `${dest.key}_B` },
    { name: `${dest.name} Subsector C`, key: `${dest.key}_C` }
  ];
}

    createButtons(dest.subDestinations);
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
    NovaAI.speak("arrival");
    currentLocation = dest.key;

    dest.subDestinations = [
      { name: "Return to Previous", key: "Return" },
      { name: `${dest.name} Core Zone`, key: `${dest.key}_1` },
      { name: `${dest.name} Outer Sector`, key: `${dest.key}_2` }
    ];

    createButtons(dest.subDestinations);
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
proceedBtn.addEventListener('click', () => {
  startupScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

onBtn.addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  travelScreen.classList.remove('hidden');
  appendLog("System: Welcome, Captain. Please select a destination.");

  // Wait until destinations are loaded
  if (mainDestinations.length > 0) {
    createButtons(mainDestinations);
  } else {
    const waitForData = setInterval(() => {
      if (mainDestinations.length > 0) {
        clearInterval(waitForData);
        createButtons(mainDestinations);
      }
    }, 100);
  }
});
