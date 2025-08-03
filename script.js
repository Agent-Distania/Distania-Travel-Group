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
// Ambient Dialogue Data
// =======================
const ambientDialogue = {
  // === Earth ===
  NewYork: [
    { speaker: "Technician", line: "Just patched another conduit. Third one this week." },
    { speaker: "Trader", line: "Shipping lanes are still backed up. Blame the kolki disaster and the amount of space debris it caused thats not cleaned up" },
    { speaker: "Civilian", line: "You ever wonder what’s *under* the megastructure?" },
    { speaker: "Courier", line: "My route got rerouted again...every damn time I do this job" },
    { speaker: "Patrolman", line: "Keep moving. Streets are restricted beyond block 5." },
    { speaker: "ECS Marine", line: "What out for the torta structure friend, grounds unstable today"},
    { speaker: "ECS Officer", line: "Enjoy your stay friend, the ECS HQ is at oregon if you need to visit, it'll be open for travel soon"},
    { speaker: "Administrative AI", line: "Reminder: Only you can prevent another kilko disaster! Report occult activity or anything strange with mega structures to the authorities immediately!"}
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
  ],

  // === Mars ===
  ColonyCore: [
    { speaker: "Botanist", line: "The trees are taking root. Finally." },
    { speaker: "Historian", line: "We almost lost this city. Almost." },
    { speaker: "Vendor", line: "Fresh synthfruit! Get it while it glows!" },
    { speaker: "Child", line: "Are the stars different on earth?" },
    { speaker: "Guard", line: "Routine scans. Don’t make this weird." },
    { speaker: "Reactor AI", line: "Reactor working at 100%, all systems nominal"}

  ],
  TerraformingFields: [
    { speaker: "DroneOperator", line: "Unit 42 stopped responding near the ridge." },
    { speaker: "Terraformer", line: "Wind’s picking up. Sandstorm incoming, maybe." },
    { speaker: "Mechanic", line: "Pump systems are jammed, I told them we need to set up sandstorm walls" },
    { speaker: "Supervisor", line: "Check the eastern dome’s pressure seal." },
    { speaker: "Biologist", line: "Soil sample B-17 is reacting... strangely." }
  ],
  AncientVault: [
    { speaker: "Archeologist", line: "These symbols repeat every 88 meters." },
    { speaker: "Linguist", line: "No match in any known dialect. Not even close." },
    { speaker: "Archivist", line: "Kilko resonance patterns are increasing." },
    { speaker: "Guard", line: "You hear that hum? It’s louder near the wall." },
    { speaker: "Explorer", line: "Whatever this place is, it's *not* dead, the machinery is just sleeping" }
  ],

  // === Europa ===
  ResearchBase: [
    { speaker: "Scientist", line: "Cracks in the ice are forming faster now, I hope its natrual" },
    { speaker: "Analyst", line: "Another drone went silent beneath layer 4, maybe elctromagnetic interference from the mega structure?" },
    { speaker: "Engineer", line: "Pressure's spiking in the lower tunnels." },
    { speaker: "Medic", line: "Radiation exposure checks are due, do not skip or the captian will have your head ona  pike!" },
    { speaker: "Geologist", line: "There’s movement under the crust, sounds like tunneling?" }
  ],
  GroundCamp: [
    { speaker: "Lead", line: "Keep your boots sealed — it’s colder than usual." },
    { speaker: "Guard", line: "Ice wolves spotted on the south ridge, best to wait a bit if your going that way, big ones today." },
    { speaker: "Surveyor", line: "We've got a partial reading from Node Delta, maybe its connected to the entrance at the south camp?" },
    { speaker: "Cook", line: "Who left the heat dome open last night?" },
    { speaker: "Rookie", line: "I swear the ice just... breathed." }
  ],
  Ruins: [
    { speaker: "DroneOp", line: "Two more scouts lost signal in the main shaft, we're gonna waste more money replacing drones than actually paying people." },
    { speaker: "Archeologist", line: "There’s geometry here that shouldn’t exist, feels like the whole structure folds in on itself." },
    { speaker: "Signal Tech", line: "Frequency drift again. That’s the third time, its getting annoying having to realign everything." },
    { speaker: "Commander", line: "No one goes deeper than sector 6. Orders, didn't go well last time due to the pressure." },
    { speaker: "Echo Analyst", line: "The walls are *responding* to us..." }
  ],

  // === Jupiter ===
  StormObservatory: [
    { speaker: "Scientist", line: "The red storm’s pulse is intensifying again." },
    { speaker: "Sensor Tech", line: "Telescopes realigned to track the outer vortex." },
    { speaker: "Engineer", line: "We lost another stabilizer. Swell, I'll get the tools." },
    { speaker: "Navigator", line: "Station drift is within margin. Barely." },
    { speaker: "Commander", line: "Prepare fallback orbit in case of breach, if the stations falls in we're all going to jail." }
  ],
  GasHarvester: [
    { speaker: "Operator", line: "Hydrogen levels are peaking. Cut intake 12%" },
    { speaker: "Technician", line: "Someone needs to grease the extractor arms, their getting slow again." },
    { speaker: "Pilot", line: "Watch for turbulence. Jupiter’s cranky today, we're on break until she calms down." },
    { speaker: "Chemist", line: "We may have found trace organics..." },
    { speaker: "Commander", line: "Prep for emergency cutoff. Always prep, best to get out and go back later than get trashed by a storm." },
    { speaker: "Platform AI", line: "All fueling platforms tilts and gathered fuel are within acceptable perameters" }
  ],
  ResearchArray: [
    { speaker: "Drone AI", line: "Node connection stable. No anomalies." },
    { speaker: "Data Analyst", line: "The magnetic shift pattern is repeating." },
    { speaker: "Admin", line: "Command uplink active. Relay is clear." },
    { speaker: "Operator", line: "Sensor 19 is acting up again. Replace it." },
    { speaker: "Monitor", line: "Telemetry from Saturn just went dark." },
    { speaker: "Camera Operator", line: "Look at this, you can see the mega structures in incredible detail here, all the strange things attached, maybe their arms? Weapons?" }
  ],
  CoreRelay: [
    { speaker: "Relay Tech", line: "Signal lag is under 12ms. Not bad." },
    { speaker: "Comms Officer", line: "Keep relay frequency clear. Priority only." },
    { speaker: "Engineer", line: "That relay beam just blinked. It’s not supposed to." },
    { speaker: "Watch", line: "Atmospheric pressure’s climbing fast, keep a eye on the pressure gauge." },
    { speaker: "Officer", line: "We’re close to the red eye. Stay sharp." }
  ],
  ExcavationPlatforms: [
    { speaker: "Lead", line: "Platform 3 is vibrating again." },
    { speaker: "Tech", line: "That artifact is glowing. Again." },
    { speaker: "Diver", line: "I saw something move in the gas." },
    { speaker: "Commander", line: "Keep scans tight. No slip-ups." },
    { speaker: "Crew", line: "Who left the gravity dampeners off? You trying to kill us?" },
    { speaker: "Diver", line: "You see things in the mega structure that defy anything you we're ever told" }
  ],

  // === Vega ===
  CapitalCity: [
    { speaker: "Resident", line: "The neon's brighter than usual." },
    { speaker: "Vendor", line: "Get your bio-glass earrings! Freshly etched!" },
    { speaker: "Runner", line: "Delivery bots are delayed. Manual runs it is." },
    { speaker: "Security", line: "No entry without Vega ID clearance." },
    { speaker: "Tourist", line: "Is that a real star fragment?" }
  ],
  OrbitalTradeRing: [
    { speaker: "Trader", line: "Cargo’s cleared customs. Finally." },
    { speaker: "Officer", line: "We intercepted a smuggler with Kilko tech." },
    { speaker: "Drone Pilot", line: "Trade pod 7 just spun out. Recovering." },
    { speaker: "Customs", line: "You need three forms for that? Ridiculous." },
    { speaker: "Announcer", line: "Attention: minor delay in sector 4 shipping lanes." }
  ],
  StellarObservationSpire: [
    { speaker: "Astronomer", line: "Another anomaly blinked at 5 AU." },
    { speaker: "Analyst", line: "We caught a flare echo. From *outside*." },
    { speaker: "Systems", line: "Array aligned. Holding stable." },
    { speaker: "Observer", line: "The Kilko field’s visible again. Barely." },
    { speaker: "Technician", line: "Sensor 3B needs realignment." }
  ],
  CrystalCanyonOutpost: [
    { speaker: "Miner", line: "Drill's stuck. Again." },
    { speaker: "Geologist", line: "These crystals resonate when we speak." },
    { speaker: "Surveyor", line: "We mapped another chamber today." },
    { speaker: "Medic", line: "Hydration levels low in Zone Delta." },
    { speaker: "AI", line: "Caution: seismic tremors detected nearby." }
  ],

  // === Andromeda ===
  ForwardRecon: [
    { speaker: "Operator", line: "Signal spike. Something’s out there." },
    { speaker: "Drone AI", line: "Scans incomplete. Retry in 3 minutes." },
    { speaker: "Watcher", line: "The void feels... different today." },
    { speaker: "Lead", line: "Automated beacon failure on channel 8." },
    { speaker: "Guard", line: "Secure the station perimeter, don't want any void bats sucking up power again." },
    { speaker: "Explorer", line: "I was on the last attempt to reach andromeda, why did they lie about why we failed?" }
  ],
  BlackSpire: [
    { speaker: "Technician", line: "Echo packets doubled in the last hour." },
    { speaker: "Watcher", line: "We’re still relaying signals from Sol, dunno why though, nothing beyond us." },
    { speaker: "Guard", line: "I swear the asteroid moved. Just a little." },
    { speaker: "Engineer", line: "Relay 9 is glowing. I hate the new bulbs they installed" },
    { speaker: "Archivist", line: "We logged a pulse from Andromeda’s edge, quite an exciting thing!" }
  ],
  XenoArchives: [
    { speaker: "Linguist", line: "Translation halted. Symbols just... shifted, fuck why dose this always happen when we make progress?" },
    { speaker: "Curator", line: "No touching the containment field, it'll shock you badly, like every other time people touched it" },
    { speaker: "Researcher", line: "This relic’s emitting a new frequency, maybe its some form od radio?" },
    { speaker: "Language AI", line: "Unknown language pattern forming. Tracking..." },
    { speaker: "Historian", line: "That statue wasn't facing that way yesterday." },
    { speaker: "ARI Marine", line: "Those statues give me nightmares, I swear they move when you don't look" }
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
      "Nova: Next stop, the void between places.",
      "Nova: Ignore any impacts you hear, it's probably just an asteroid.",
      "Nova: Hull integrity holding at 100%, brace for arrival",
      "Nova: Did you know you could survive for up to 2 minutes in the vaccum of space? You'd lose consciousness after 15 seconds tho"
    ],
    arrival: [
      "Nova: Arrival confirmed. No hull breaches detected.",
      "Nova: Welcome. Conditions seem... breathable.",
      "Nova: Surface scans are returning anomalies. Intriguing.",
      "Nova: I suggest keeping your helmet on.",
      "Nova: We've arrived. Try not to break anything, Captain.",
      "Nova: The stars are beautiful here at night",
      "Nova: Remember to take your pistol; thieves can't steal if they're not breathing!",
      "Nova: If you can, get me an AI body. I'm tired of being a disembodied ship voice."
    ],
    idle: [
      "Nova: Systems green. Do you require anything, Captain?",
      "Nova: Monitoring sensors. Silence is... eerie.",
      "Nova: No threats detected. For now.",
      "Nova: If you're contemplating, I recommend the Vega view.",
      "Nova: I've re-calibrated your neural quiet mode. You're welcome.",
      "Nova: I don't like it when you get quiet. Do I need to phone a friend?",
      "Nova: Please tell me you're not experiencing PTSD, Captain. The last time was... unideal.",
      "Nova: I wish I had a body like that old video game character. Her name starts with a C?"
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
    if (dest.key === "EarthSpacePort") {
         dest.subDestinations = [
        { name: "Return to Previous", key: "Return" },
        { name: "Processing", key: "EarthSpacePort_FrontDesk" },
        { name: "Cargo Intake", key: "EarthSpacePort_Cargo" },
        { name: "Docking Bay", key: "EarthSpacePort_Docking"
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
  createButtons(mainDestinations);
});
