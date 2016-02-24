export const formats = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', ' €'],
  dateTime: '%A, der %e. %B %Y, %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
};

export const terms = {
  // Phrases
  PHRASE_BACKUP_DESC: 'Export aller Coriolis-Daten, um sie zu sichern oder oder um sie zu einem anderen Browser/Gerät zu übertragen.',  // Backup of all Coriolis data to save or transfer to another browser/device
  PHRASE_CONFIRMATION: 'Sind Sie sicher?',  // Are You Sure?
  PHRASE_EXPORT_DESC: 'Ein detaillierter JSON-Export Ihrer Konfiguration für die Verwendung in anderen Websites und Tools', // A detailed JSON export of your build for use in other sites and tools
  PHRASE_FASTEST_RANGE: null, // Consecutive max range jumps
  PHRASE_IMPORT: 'JSON hier einfügen oder importieren', // Paste JSON or import here
  PHRASE_LADEN: null, // Ship Mass + Fuel + Cargo
  PHRASE_NO_BUILDS: 'Keine Konfigurationen zum Vergleich ausgewählt!',  // No builds added to comparison!
  PHRASE_NO_RETROCH: 'Keine Umrüständerungen',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Ausstattung zum Vergleich auswählen',  // Select Builds to Compare
  PHRASE_SG_RECHARGE: null, // Time from 50% to 100% Charge
  PHRASE_SG_RECOVER: null,  // Recovery (to 50%) after collapse
  PHRASE_UNLADEN: null, // Ship Mass excluding Fuel and Cargo
  PHRASE_UPDATE_RDY: 'Update verfügbar! Klicken zum Aktualisieren', // Update Available! Click to Refresh

  // Modules / Module Types - These should match the in-game translation (if any)
  'Basic Discovery Scanner': 'einfacher Aufklärungsscanner',  // Basic Discovery Scanner
  'Cargo Hatch': 'Frachtluke',  // Cargo Hatch
  'Chaff Launcher': 'Düppel-Werfer',  // Chaff Launcher
  'Detailed Surface Scanner': 'Detailoberflächenscanner', // Detailed Surface Scanner
  'Electronic Countermeasure': 'elektronische Gegenmaßnahme', // Electronic Countermeasure
  'Heat Sink Launcher': 'Kühlkörperwerfer', // Heat Sink Launcher
  'Intermediate Discovery Scanner': 'mittlerer Aufklärungsscanner', // Intermediate Discovery Scanner
  'Point Defence': 'Punktverteidigung',
  'Standard Docking Computer': 'Standard-Landecomputer',  // Standard Docking Computer
  am: 'automatische Feldwartungs-Einheit',  // Auto Field-Maintenance Unit
  bh: 'Rumpfhüllenverstärkung', // Bulkheads
  bl: 'Strahlenlaser',  // Beam Laser
  c: 'Kanone',  // Cannon
  cc: 'Krallensteuerung: Sammler',  // Collector Limpet Controller
  cm: 'Gegenmaßnahme',  // Countermeasure
  cr: 'Frachtgestell',  // Cargo Rack
  cs: 'Frachtscanner',  // Cargo Scanner
  dc: 'Standard-Landecomputer', // Docking Computer
  fc: 'Splitterkanone', // Fragment Cannon
  fi: 'FSA-Unterbrecher', // FSD Interdictor
  fs: 'Treibstoffsammler',  // Fuel Scoop
  fsd: 'Frameshiftantrieb', // Frame Shift Drive
  ft: 'Treibstofftank', // Fuel Tank
  fx: 'Krallensteuerung Treibstoffstransfer', // Fuel Transfer Limpet Controller
  hb: 'Krallen-Steuereinheit (Ladelukenöffner)',  // Hatch Breaker Limpet Controller
  hr: 'Rumpfhüllenverstärkung (Paket)', // Hull Reinforcement Package
  kw: 'Tötungsbefehl-Scanner',  // Kill Warrant Scanner
  ls: 'Lebenserhaltung',  // life support
  mc: 'Mehrfachgeschütz', // Multi-cannon
  ml: 'Abbaulaser', // Mining Laser
  mr: 'Raketenbatterie',  // Missile Rack
  nl: 'Minenwerfer',  // Mine Launcher
  pa: 'Plasmabeschleuniger',  // Plasma Accelerator
  pc: 'Krallensteuerung: Erzsucher',  // Prospector Limpet Controller
  pd: 'Energieverteiler', // power distributor
  pl: 'Impulslaser',  // Pulse Laser
  pp: 'Kraftwerk',  // Power Plant
  psg: 'Prismaschildgenerator', // Prismatic Shield Generator
  rf: 'Raffinerie', // Refinery
  rg: 'Schienenkanone', // Rail Gun
  s: 'Sensoren',  // Sensors
  sb: 'Schild-Booster', // Shield Booster
  sc: 'Scanner',  // Scanner
  scb: 'Schildzellenbank',  // Shield Cell Bank
  sg: 'Schildgenerator',  // Shield Generator
  t: 'Schubdüsen',  // Thrusters
  tp: 'Torpedoaufhängung',  // Torpedo Pylon
  ul: 'Salvenlaser',  // Burst Laser
  ws: 'Frameshift-Sogwolkenscanner',  // Frame Shift Wake Scanner
  // Bulkheads - These should match the in-game translation (if any)
  'Lightweight Alloy': 'leichte Legierung',
  'Reinforced Alloy': 'verstärkte Legierung',
  'Military Grade Composite': 'Militär-Komposit',
  'Mirrored Surface Composite': 'Gespiegelte-Oberfläche-Komposit',
  'Reactive Surface Composite': 'Reaktive-Oberfläche-Komposit',
  // Units / Metrics
  LY: 'Lj', // Light Years
  T: 't', // Tons (Metric Ton - 1000kg)

  // Sizes
  S: 'K', // Small Hardpoint (single Character)
  L: 'G', // Large Hardpoint size (single character)
  H: 'R', // Huge Hardpoint size (single character)
  U: 'W', // Utility Hardpoint size (single character) - Kill warrant scanner, etc

  // Terms
  'build name': 'Ausstattungsname', // Ship build/configuration/design name
  'compare all': 'Alles vergleichen',
  'create new': 'Neu erstellen',
  'damage per second': null,
  'delete all': 'Alles Löschen',
  'detailed export': 'detailierter Export',
  'edit data': 'bearbeiten',
  'empty all': 'leer alles',
  'Enter Name': 'Namen eingeben',
  'fastest range': null,  // Fastet totaljump range - sum of succesive jumps
  'fuel level': null, // Percent of fuel (T) in the tank
  'full tank': 'Tank voll',
  'internal compartments': 'Innenbereich',
  'jump range': 'Sprungreichweite',
  'mass lock factor': 'Massensperrefaktor',
  'max mass': 'maximale Masse',
  'net cost': 'Nettokosten',
  'none created': 'Leer',
  'optimal mass': null, // Lowest weight / best weight for jump distance, etc
  'refuel time': 'Auftankzeit', // Time to refuel the tank when scooping
  'reload costs': null,
  'retrofit costs': 'Änderungskosten',  // The cost difference when upgrading / downgrading a component
  'retrofit from': 'Nachrüsten von',  // Retrofit from Build A against build B
  'T-Load': 'T-Lad',  // Thermal load abbreviation
  'total range': null,
  'unit cost': null,
  'utility mounts': 'Werkzeug-Steckplätze',
  about: 'Über',  // Link to about page / about Coriolis.io
  action: 'Aktion',
  added: 'hinzugefügt',
  ammo: 'Munition', // Ammunition
  armour: 'Panzerung',
  available: 'verfügbar',
  backup: 'Sicherungsdatei',
  base: null,
  bays: null,
  bins: 'Behälter', // Number of Mining Refinery bins
  build: 'Ausstattung', // Shorthand for the build/configuration/design name
  builds: 'Ausstattungen',  // Ship build/configuration/design names
  buy: 'kaufen',
  cancel: 'Abbrechen',
  cargo: 'Fracht',
  cells: 'Zellen',  // Number of cells in a shield cell bank
  close: 'Schließen',
  compare: 'vergleichen',
  comparison: 'Vergleich',
  comparisons: 'Vergleiche',
  cost: 'Preis',  // Cost / price of a module or price of a ship
  costs: 'Kosten',  // Costs / prices of a modules or prices of ships
  create: 'erstellen',
  credits: 'Credits',
  damage: 'Schaden',
  delete: 'Löschen',
  dep: 'Ausg',  // Weapons/Hardpoints Deployed abbreviation
  deployed: 'Ausgefahren',  // Weapons/Hardpoints Deployed
  disabled: 'Deaktiviert',
  discount: 'Rabatt',
  efficiency: 'Effizienz',  // Power Plant efficiency
  empty: 'leer',
  ENG: 'ANT', // Abbreviation - Engine recharge rate for power distributor
  Explorer: 'Forscher',
  forum: 'Forum',
  fuel: 'Treibstoff',
  hardpoints: 'Waffenaufhängungen',
  hull: 'Hülle',  // Ships hull
  import: 'importieren',
  insurance: 'Versicherung',
  jump: null, // Single jump range
  jumps: 'Sprünge',
  laden: 'beladen',
  language: 'Sprache',
  maneuverability: 'Manövrierbarkeit',
  manufacturer: null,
  mass: 'Masse',
  MLF: null,  // Mass Lock Factor Abbreviation
  MNV: null,  // Maneuverability abbreviation
  module: 'modul',
  modules: 'module',
  no: 'Nein',
  ok: 'OK',
  optimize: null,
  pen: 'Durchdr.',  // Armour peneration abbreviation
  power: 'Energie', // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  pri: 'Prio',  // Priority abbreviation for power management
  proceed: 'Fortfahren',
  PWR: 'En',  // Power Abbreviation. See Power
  qty: null,  // Quantity abbreviation
  range: 'Reichweite',
  rate: 'Rate',
  recharge: null, // Shield Recharge time from 50% -> 100%
  recovery: null, // Shield recovery time (after losing shields/turning on -> 50%)
  reload: 'aktualisieren',  // Reload weapon/hardpoint
  rename: 'umbenennen',
  repair: 'reparieren',
  reset: 'zurücksetzen',
  ret: 'Eing',  // Retracted abbreviation
  retracted: 'Eingefahren', // Weapons/Hardpoints retracted
  ROF: 'Kad', // Rate of Fire abbreviation
  roles: null,  // Commander/Ship build roles - e.g. Trader, Bounty-Hunter, Explorer, etc
  save: 'Speichern',
  sell: 'Verkaufen',
  settings: 'Einstellungen',  // Coriolis application settings
  shields: 'Schilde',
  ship: 'Schiff',
  ships: 'Schiffe',
  shortened: 'gekürzt', // Standard/Stock build of a ship when purchased new
  size: 'Größe',
  skip: 'überspringen', // Skip past something / ignore it
  speed: 'Geschwindigkeit',
  standard: 'Standard', // Standard / Common modules (FSD, power plant, life support, etc)
  Stock: 'Standard',  // Thermal-load abbreviation
  strength: null, // Strength in reference to Shield Strength
  subtotal: null,
  time: 'Dauer',  // time it takes to complete something
  tooltips: null, // Tooltips setting - show/hide
  total: 'Gesamt',
  Trader: null, // Trader role
  type: 'Typ',
  unladen: 'Unbeladen', // No cargo or fuel
  WEP: 'WAF', // Abbreviation - Weapon recharge rate for power distributor
  yes: 'Ja'
};
