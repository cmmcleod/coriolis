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
  PHRASE_BACKUP_DESC: 'Export aller Coriolis-Daten, um sie zu sichern oder um sie zu einem anderen Browser/Gerät zu übertragen.', // Backup of all Coriolis data to save or transfer to another browser/device
  PHRASE_CONFIRMATION: 'Sind Sie sicher?',  // Are You Sure?
  PHRASE_EXPORT_DESC: 'Ein detaillierter JSON-Export Ihrer Konfiguration für die Verwendung in anderen Websites und Tools', // A detailed JSON export of your build for use in other sites and tools
  PHRASE_FASTEST_RANGE: 'aufeinanderfolgende maximale Reichweite/Sprünge',  // Consecutive max range jumps
  PHRASE_IMPORT: 'JSON hier einfügen oder importieren', // Paste JSON or import here
  PHRASE_LADEN: 'Schiffsmasse + Treibstoff + Fracht', // Ship Mass + Fuel + Cargo
  PHRASE_NO_BUILDS: 'Keine Konfigurationen zum Vergleich ausgewählt!',  // No builds added to comparison!
  PHRASE_NO_RETROCH: 'Keine Umrüständerungen',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Ausstattung zum Vergleich auswählen',  // Select Builds to Compare
  PHRASE_SG_RECHARGE: 'Zeit von 50% bis 100% der Ladung', // Time from 50% to 100% Charge
  PHRASE_SG_RECOVER: 'Erneuerung (zu 50%) nach Zusammenbruch',  // Recovery (to 50%) after collapse
  PHRASE_UNLADEN: 'Schiffsmasse ohne Treibstoff und Fracht',  // Ship Mass excluding Fuel and Cargo
  PHRASE_UPDATE_RDY: 'Update verfügbar! Klicken zum Aktualisieren', // Update Available! Click to Refresh

  // Units / Metrics
  LY: 'Lj', // Light Years
  T: 't', // Tons (Metric Ton - 1000kg)

  // Sizes
  S: 'K', // Small Hardpoint (single Character)
  L: 'G', // Large Hardpoint size (single character)
  H: 'R', // Huge Hardpoint size (single character)
  U: 'W', // Utility Hardpoint size (single character) - Kill warrant scanner, etc
  small: 'klein', // Small ship size
  medium: 'mittel', // Medium ship size
  large: 'groß',  // Large Ship Size

  // Terms
  about: 'über',  // Link to about page / about Coriolis.io
  action: 'Aktion',
  added: 'hinzugefügt',
  ammo: 'Munition', // Ammunition
  armour: 'Panzerung',
  available: 'verfügbar', // Available options
  backup: 'Sicherungsdatei',
  base: 'Basis',  // Base speed, boost, etc - Base ship stats
  bays: 'Lagerraum',
  bins: 'Behälter', // Number of Mining Refinery bins
  build: 'Ausstattung', // Shorthand for the build/configuration/design name
  'build name': 'Ausstattungsname', // Ship build/configuration/design name
  builds: 'Ausstattungen',  // Ship build/configuration/design names
  buy: 'kaufen',
  cancel: 'abbrechen',
  cargo: 'Fracht',
  cells: 'Zellen',  // Number of cells in a shield cell bank
  close: 'schließen',
  compare: 'vergleichen',
  'compare all': 'alles vergleichen',
  comparison: 'Vergleich',
  comparisons: 'Vergleiche',
  cost: 'Preis',  // Cost / price of a module or price of a ship
  costs: 'Kosten',  // Costs / prices of a modules or prices of ships
  create: 'erstellen',
  'create new': 'neu erstellen',
  credits: 'Credits',
  damage: 'Schaden',
  'damage per second': 'Schaden pro Sekunde',
  delete: 'löschen',
  'delete all': 'alles löschen',
  dep: 'ausg',  // Weapons/Hardpoints Deployed abbreviation
  deployed: 'ausgefahren',  // Weapons/Hardpoints Deployed
  'detailed export': 'detailierter Export',
  disabled: 'deaktiviert',
  discount: 'Rabatt',
  'edit data': 'bearbeiten',
  efficiency: 'Effizienz',  // Power Plant efficiency
  empty: 'leer',
  'empty all': 'alles entfernen',
  ENG: 'ANT', // Abbreviation - Engine recharge rate for power distributor
  'Enter Name': 'Namen eingeben',
  Explorer: 'Forscher',
  export: 'Export',
  'fastest range': 'maximale Reichweite', // Fastet totaljump range - sum of succesive jumps
  forum: 'Forum',
  fuel: 'Treibstoff',
  'fuel level': 'Tankfüllstand',  // Percent of fuel (T) in the tank
  'full tank': 'Tank voll',
  hardpoints: 'Waffenaufhängungen',
  hull: 'Rumpf',  // Ships hull
  import: 'importieren',
  insurance: 'Versicherung',
  'internal compartments': 'Innenbereich',
  jump: 'Sprung', // Single jump range
  'jump range': 'Sprungreichweite',
  jumps: 'Sprünge',
  laden: 'beladen',
  language: 'Sprache',
  maneuverability: 'Manövrierbarkeit',
  manufacturer: 'Hersteller',
  mass: 'Masse',
  'mass lock factor': 'Massensperrefaktor',
  'max mass': 'maximale Masse',
  MLF: 'MSF', // Mass Lock Factor Abbreviation
  module: 'Modul',
  modules: 'Module',
  'net cost': 'Nettokosten',
  no: 'Nein',
  'none created': 'nicht erstellt',
  ok: 'OK',
  'optimal mass': 'optimale Masse', // Lowest weight / best weight for jump distance, etc
  optimize: 'optimieren',
  pen: 'Durchdr.',  // Armour peneration abbreviation
  permalink: 'Permanentlink',
  power: 'Energie', // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  pri: 'Prio',  // Priority abbreviation for power management
  proceed: 'fortfahren',
  qty: 'Menge', // Quantity abbreviation
  range: 'Reichweite',
  rate: 'Rate',
  recharge: 'aufladen', // Shield Recharge time from 50% -> 100%
  recovery: 'Erneuerung', // Shield recovery time (after losing shields/turning on -> 50%)
  'refuel time': 'Auftankzeit', // Time to refuel the tank when scooping
  reload: 'aktualisieren',  // Reload weapon/hardpoint
  'reload costs': 'Nachladekosten',
  rename: 'umbenennen',
  repair: 'reparieren',
  reset: 'zurücksetzen',
  ret: 'eing',  // Retracted abbreviation
  retracted: 'eingefahren', // Weapons/Hardpoints retracted
  'retrofit costs': 'Änderungskosten',  // The cost difference when upgrading / downgrading a component
  'retrofit from': 'nachrüsten von',  // Retrofit from Build A against build B
  ROF: 'Kad', // Rate of Fire abbreviation
  roles: 'Rollen',  // Commander/Ship build roles - e.g. Trader, Bounty-Hunter, Explorer, etc
  save: 'speichern',
  sell: 'verkaufen',
  settings: 'Einstellungen',  // Coriolis application settings
  shields: 'Schilde',
  ship: 'Schiff',
  ships: 'Schiffe',
  shortened: 'gekürzt', // Standard/Stock build of a ship when purchased new
  size: 'Größe',
  skip: 'überspringen', // Skip past something / ignore it
  speed: 'Geschwindigkeit',
  standard: 'Grundausstattung', // Standard / Common modules (FSD, power plant, life support, etc)
  Stock: 'Standard',  // Thermal-load abbreviation
  strength: 'Stärke', // Strength in reference to Shield Strength
  subtotal: 'Zwischensumme',
  time: 'Dauer',  // time it takes to complete something
  tooltips: 'Tooltips', // Tooltips setting - show/hide
  total: 'gesamt',
  'total range': 'Gesamtbereich',
  Trader: 'Händler',  // Trader role
  type: 'Typ',
  'unit cost': 'Kosten pro Einheit',
  unladen: 'unbeladen', // No cargo or fuel
  'utility mounts': 'Werkzeug-Steckplätze',
  WEP: 'WAF', // Abbreviation - Weapon recharge rate for power distributor
  yes: 'ja'
};
