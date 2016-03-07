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
  PHRASE_FASTEST_RANGE: 'Consécutifs sauts de portée maximale', // Consecutive max range jumps
  PHRASE_IMPORT: 'Coller JSON ou importer ici', // Paste JSON or import here
  PHRASE_LADEN: 'Navire de masse + carburant + Cargo',  // Ship Mass + Fuel + Cargo
  PHRASE_NO_BUILDS: 'Défaut de configuration pour comparaison', // No builds added to comparison!
  PHRASE_NO_RETROCH: 'configuration non modifiée',  // No Retrofitting changes
  PHRASE_SELECT_BUILDS: 'Sélectionner configurations à comparer', // Select Builds to Compare
  PHRASE_SG_RECHARGE: 'Temps de 50% à 100 % de charge', // Time from 50% to 100% Charge
  PHRASE_SG_RECOVER: 'récupération (à 50 %) après l\'effondrement', // Recovery (to 50%) after collapse
  PHRASE_UNLADEN: 'Navire de masse hors carburant et Cargo',  // Ship Mass excluding Fuel and Cargo
  PHRASE_UPDATE_RDY: 'Mise à jour disponible ! Cliquez pour rafraichir',  // Update Available! Click to Refresh

  // Units / Metrics
  Ls: 'SL', // Light seconds
  LY: 'AL', // Light Years

  // Sizes
  L: 'G', // Large Hardpoint size (single character)
  large: 'grand', // Large Ship Size
  medium: 'moyen',  // Medium ship size
  S: 'P', // Small Hardpoint (single Character)
  small: 'petit', // Small ship size

  // Terms
  'build name': 'Nom de la configuration',  // Ship build/configuration/design name
  'compare all': 'tout comparer',
  'create new': 'Créer nouveau',
  'damage per second': 'dégât par seconde',
  'delete all': 'tout supprimer',
  'detailed export': 'export détaillé',
  'edit data': 'Editer donnée',
  'empty all': 'vide tout',
  'Enter Name': 'Entrer nom',
  'fastest range': 'gamme la plus rapide',  // Fastet totaljump range - sum of succesive jumps
  'fuel level': 'niveau de carburant',  // Percent of fuel (T) in the tank
  'full tank': 'Réservoir plein',
  'internal compartments': 'compartiments internes',
  'jump range': 'Distance de saut',
  'mass lock factor': 'facteur inhibition de masse',
  'max mass': 'masse max',
  'net cost': 'coûts nets',
  'none created': 'Rien de créé',
  'optimal mass': 'masse optimale', // Lowest weight / best weight for jump distance, etc
  'refuel time': 'Temps de remplissage',  // Time to refuel the tank when scooping
  'reload costs': 'recharger coûts',
  'retrofit costs': 'Valeur de rachat', // The cost difference when upgrading / downgrading a component
  'retrofit from': 'Racheter de', // Retrofit from Build A against build B
  'T-Load': 'degrés', // Thermal load abbreviation
  'total range': 'plage totale',
  'unit cost': 'coût unitaire',
  'utility mounts': 'Support utilitaire',
  about: 'à propos',  // Link to about page / about Coriolis.io
  added: 'ajouté',
  ammo: 'munition', // Ammunition
  armour: 'Armure',
  available: 'Disponibilité', // Available options
  backup: 'sauvegarde',
  bays: 'baies',
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
  damage: 'dégât',
  delete: 'supprimer',
  dep: 'depl',  // Weapons/Hardpoints Deployed abbreviation
  deployed: 'déployé',  // Weapons/Hardpoints Deployed
  disabled: 'désactivé',
  discount: 'ristourne',
  efficiency: 'rendement',  // Power Plant efficiency
  empty: 'Vide',
  Explorer: 'explorateur',
  fuel: 'carburant',
  hardpoints: 'Points d\'emport',
  hull: 'Coque',  // Ships hull
  import: 'Importer',
  insurance: 'Assurance',
  jump: 'saut', // Single jump range
  jumps: 'Sauts',
  laden: 'chargé',
  language: 'Langage',
  maneuverability: 'maniabilité',
  manufacturer: 'fabricant',
  mass: 'Masse',
  MLF: 'FIM', // Mass Lock Factor Abbreviation
  no: 'non',
  ok: 'D\'accord',
  optimize: 'optimiser',
  pen: 'pén.',  // Armour peneration abbreviation
  permalink: 'lien durable',
  power: 'énergie', // Power = Energy / second. Power generated by the power plant, or power consumed (MW / Mega Watts). Used in the power plant section
  proceed: 'continuer',
  PWR: 'P', // Power Abbreviation. See Power
  qty: 'quantité',  // Quantity abbreviation
  range: 'portée',
  rate: 'cadence',
  recharge: 'recharger',  // Shield Recharge time from 50% -> 100%
  recovery: 'récupération', // Shield recovery time (after losing shields/turning on -> 50%)
  reload: 'recharger',  // Reload weapon/hardpoint
  rename: 'renommer',
  repair: 'réparer',
  reset: 'Réinitialisation',
  ret: 'esc', // Retracted abbreviation
  retracted: 'escamoté',  // Weapons/Hardpoints retracted
  ROF: 'cadence', // Rate of Fire abbreviation
  roles: 'rôles', // Commander/Ship build roles - e.g. Trader, Bounty-Hunter, Explorer, etc
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
  strength: 'force',  // Strength in reference to Shield Strength
  subtotal: 'Sous-Total',
  time: 'temps',  // time it takes to complete something
  tooltips: 'infobulles', // Tooltips setting - show/hide
  Trader: 'commerçant', // Trader role
  unladen: 'Non chargé',  // No cargo or fuel
  WEP: 'ARM', // Abbreviation - Weapon recharge rate for power distributor
  yes: 'oui'
};
