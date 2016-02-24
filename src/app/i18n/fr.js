export const formats = {
  decimal: ',',
  thousands: '.',
  grouping: [3],
  currency: ['', ' €'],
  dateTime: '%A, le %e %B %Y, %X',
  date: '%d/%m/%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'], // unused
  days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
};

export const terms = {
  // Phrases
  PHRASE_BACKUP_DESC: 'Exportation détaillée des données Coriolis pour l\'utilisation dans d\'autres sites et outils',  // Backup of all Coriolis data to save or transfer to another browser/device
  PHRASE_CONFIRMATION: 'Êtes-vous sûr?',  // Are You Sure?
  PHRASE_EXPORT_DESC: 'Un export détaillé en JSON de votre configuration pour l\'utilisation dans d\'autres sites et outils', // A detailed JSON export of your build for use in other sites and tools
  PHRASE_IMPORT: 'Coller JSON ou importer ici', // Paste JSON or import here
  PHRASE_NO_BUILDS: 'Défaut de configuration pour comparaison', // No builds added to comparison!
  PHRASE_NO_RETROCH: 'configuration non modifiée',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Sélectionner configurations à comparer', // Select Builds to Compare
  PHRASE_UPDATE_RDY: 'Mise à jour disponible ! Cliquez pour rafraichir',  // Update Available! Click to Refresh

  // Modules / Module Types - These should match the in-game translation (if any)
  am: 'Unité de maintenance de terrain auto', // Auto Field-Maintenance Unit
  'Basic Discovery Scanner': 'Détecteur de découverte simple',  // Basic Discovery Scanner
  bh: 'Coque',  // Bulkheads
  bl: 'Rayon Laser',  // Beam Laser
  'Cargo Hatch': 'Ecoutille de soute',  // Cargo Hatch
  c: 'Canon', // Cannon
  cc: 'Contrôleur de collecteurs',  // Collector Limpet Controller
  cm: 'Contre-mesure',  // Countermeasure
  'Chaff Launcher': 'Lanceur de paillettes',  // Chaff Launcher
  cr: 'Compartiment de soute',  // Cargo Rack
  cs: 'Scanner de soute', // Cargo Scanner
  dc: 'Ordinateur d\'appontage',  // Docking Computer
  'Detailed Surface Scanner': 'Détecteur de surface détaillé',  // Detailed Surface Scanner
  'Electronic Countermeasure': 'Contre mesure électronique',  // Electronic Countermeasure
  fc: 'Canon à fragmentation',  // Fragment Cannon
  fi: 'Intercepteur de réacteur FSD', // FSD Interdictor
  fs: 'Récupérateur de carburant',  // Fuel Scoop
  fsd: 'Réacteur FSD',  // Frame Shift Drive
  ft: 'Réservoir de carburant', // Fuel Tank
  fx: 'Drone de ravitaillement',  // Fuel Transfer Limpet Controller
  'Heat Sink Launcher': 'Ejecteur de dissipateur thermique',  // Heat Sink Launcher
  hb: 'Contrôle de patelle perce-soute',  // Hatch Breaker Limpet Controller
  hr: 'Renfort de soute', // Hull Reinforcement Package
  'Intermediate Discovery Scanner': 'Détecteur de découverte intermédiaire',  // Intermediate Discovery Scanner
  kw: 'Détecteur d\'avis de recherche', // Kill Warrant Scanner
  ls: 'Support vital',  // life support
  mc: 'Canon multiple', // Multi-cannon
  ml: 'Laser minier', // Mining Laser
  mr: 'Lance missiles', // Missile Rack
  nl: 'Lance-mines',  // Mine Launcher
  pa: 'accélérateur plasma',  // Plasma Accelerator
  pc: 'Drône de minage',  // Prospector Limpet Controller
  pd: 'distributeur d\'énérgie',  // power distributor
  pl: 'Laser à impulsion',  // Pulse Laser
  'Point Defence': 'Défense ponctuelle',
  pp: 'centrale d\'énergie',  // Power Plant
  psg: 'générateur de bouclier prisme', // Prismatic Shield Generator
  rf: 'Raffinerie', // Refinery
  rg: 'Canon électromagnétique',  // Rail Gun
  s: 'détecteurs',  // Sensors
  sb: 'Survolteur de bouclier', // Shield Booster
  sc: 'scanner',  // Scanner
  scb: 'Réserve de cellules d\'énergie',  // Shield Cell Bank
  sg: 'Générateur de bouclier', // Shield Generator
  'Standard Docking Computer': 'ordinateur d\'appontage standard',  // Standard Docking Computer
  t: 'propulseurs', // Thrusters
  tp: 'Tube lance-torpille',  // Torpedo Pylon
  ul: 'Laser à rafale', // Burst Laser
  ws: 'Détecteur de sillage FSD', // Frame Shift Wake Scanner

  // Bulkheads - These should match the in-game translation (if any)
  'Lightweight Alloy': 'alliage léger',
  'Reinforced Alloy': 'alliage renforcé',
  'Military Grade Composite': 'Composite militaire',
  'Mirrored Surface Composite': 'Composite à surface mirroir',
  'Reactive Surface Composite': 'Composite à surface réactive',

  // Units / Metrics
  Ls: 'SL', // Light seconds
  LY: 'AL', // Light Years

  // Sizes
  S: 'P', // Small Hardpoint (single Character)
  L: 'G', // Large Hardpoint size (single character)

  // Terms
  'build name': 'Nom de la configuration',  // Ship build/configuration/design name
  'compare all': 'tout comparer',
  'create new': 'Créer nouveau',
  'damage per second': null,
  'delete all': 'tout supprimer',
  'detailed export': 'export détaillé',
  'edit data': 'Editer donnée',
  'empty all': null,
  'Enter Name': 'Entrer nom',
  'fastest range': null,  // Fastet totaljump range - sum of succesive jumps
  'fuel level': null, // Percent of fuel (T) in the tank
  'full tank': 'Réservoir plein',
  'internal compartments': 'compartiments internes',
  'jump range': 'Distance de saut',
  'mass lock factor': 'facteur inhibition de masse',
  'max mass': 'masse max',
  'net cost': 'coûts nets',
  'none created': 'Rien de créé',
  'optimal mass': null, // Lowest weight / best weight for jump distance, etc
  'refuel time': 'Temps de remplissage',  // Time to refuel the tank when scooping
  'reload costs': null,
  'retrofit costs': 'Valeur de rachat', // The cost difference when upgrading / downgrading a component
  'retrofit from': 'Racheter de', // Retrofit from Build A against build B
  'T-Load': 'degrés', // Thermal load abbreviation
  'total range': null,
  'unit cost': null,
  'utility mounts': 'Support utilitaire',
  about: 'à propos',  // Link to about page / about Coriolis.io
  added: 'ajouté',
  ammo: 'munition', // Ammunition
  armour: 'Armure',
  available: 'Disponibilité',
  backup: 'sauvegarde',
  base: null,
  bays: null,
  bins: 'bacs', // Number of Mining Refinery bins
  build: 'Configuration', // Shorthand for the build/configuration/design name
  builds: 'Configurations', // Ship build/configuration/design names
  buy: 'Acheter',
  cancel: 'Annuler',
  cargo: 'Soute',
  cells: 'Cellule', // Number of cells in a shield cell bank
  close: 'fermer',
  compare: 'comparer',
  comparison: 'comparaison',
  comparisons: 'comparaisons',
  cost: 'coût', // Cost / price of a module or price of a ship
  costs: 'coûts', // Costs / prices of a modules or prices of ships
  create: 'Créer',
  credits: 'crédits',
  damage: 'Dégâts',
  delete: 'supprimer',
  dep: 'depl',  // Weapons/Hardpoints Deployed abbreviation
  deployed: 'déployé',  // Weapons/Hardpoints Deployed
  disabled: 'désactivé',
  discount: 'ristourne',
  efficiency: 'rendement',  // Power Plant efficiency
  empty: 'Vide',
  Explorer: null,
  fuel: 'carburant',
  hardpoints: 'Points d\'emport',
  hull: 'Coque',  // Ships hull
  import: 'Importer',
  insurance: 'Assurance',
  jump: null, // Single jump range
  jumps: 'Sauts',
  laden: 'chargé',
  language: 'Langage',
  maneuverability: null,
  manufacturer: null,
  mass: 'Masse',
  MLF: null,  // Mass Lock Factor Abbreviation
  MNV: null,  // Maneuverability abbreviation
  module: null,
  modules: null,
  no: 'non',
  ok: 'D\'accord',
  optimize: null,
  pen: 'pén.',  // Armour peneration abbreviation
  permalink: 'lien durable',
  power: 'énergie', // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  proceed: 'continuer',
  PWR: 'P', // Power Abbreviation. See Power
  qty: null,  // Quantity abbreviation
  range: 'portée',
  rate: 'cadence',
  recharge: null, // Shield Recharge time from 50% -> 100%
  recovery: null, // Shield recovery time (after losing shields/turning on -> 50%)
  reload: 'recharger',  // Reload weapon/hardpoint
  rename: 'renommer',
  repair: 'réparer',
  reset: 'Réinitialisation',
  ret: 'esc', // Retracted abbreviation
  retracted: 'escamoté',  // Weapons/Hardpoints retracted
  ROF: 'cadence', // Rate of Fire abbreviation
  roles: null,  // Commander/Ship build roles - e.g. Trader, Bounty-Hunter, Explorer, etc
  save: 'sauvegarder',
  sell: 'vendre',
  settings: 'paramètres', // Coriolis application settings
  shields: 'boucliers',
  ship: 'vaisseau',
  ships: 'vaisseaux',
  shortened: 'raccourci', // Standard/Stock build of a ship when purchased new
  size: 'taille',
  skip: 'Suivant',  // Skip past something / ignore it
  speed: 'vitesse',
  Stock: 'de base', // Thermal-load abbreviation
  strength: null, // Strength in reference to Shield Strength
  subtotal: null,
  time: 'temps',  // time it takes to complete something
  tooltips: null, // Tooltips setting - show/hide
  Trader: null, // Trader role
  unladen: 'Non chargé',  // No cargo or fuel
  WEP: 'ARM', // Abbreviation - Weapon recharge rate for power distributor
  yes: 'oui'
};
