
export const ArmourMultiplier = [
  1,      // Lightweight
  1.4,    // Reinforced
  1.945,  // Military
  1.945,  // Mirrored
  1.945   // Reactive
];

export const SizeMap = ['', 'small', 'medium', 'large', 'capital'];

// Map to lookup group labels/names for component grp, used for JSON Serialization
export const ModuleGroupToName = {
  // Standard
  pp: 'Power Plant',
  t: 'Thrusters',
  fsd: 'Frame Shift Drive',
  ls: 'Life Support',
  pd: 'Power Distributor',
  s: 'Sensors',
  ft: 'Fuel Tank',

  // Internal
  fs: 'Fuel Scoop',
  sc: 'Scanner',
  am: 'Auto Field-Maintenance Unit',
  cr: 'Cargo Rack',
  fi: 'Frame Shift Drive Interdictor',
  hb: 'Hatch Breaker Limpet Controller',
  hr: 'Hull Reinforcement Package',
  rf: 'Refinery',
  scb: 'Shield Cell Bank',
  sg: 'Shield Generator',
  psg: 'Prismatic Shield Generator',
  dc: 'Docking Computer',
  fx: 'Fuel Transfer Limpet Controller',
  pc: 'Prospector Limpet Controller',
  cc: 'Collector Limpet Controller',

  // Hard Points
  bl: 'Beam Laser',
  ul: 'Burst Laser',
  c: 'Cannon',
  cs: 'Cargo Scanner',
  cm: 'Countermeasure',
  fc: 'Fragment Cannon',
  ws: 'Frame Shift Wake Scanner',
  kw: 'Kill Warrant Scanner',
  nl: 'Mine Launcher',
  ml: 'Mining Laser',
  mr: 'Missile Rack',
  pa: 'Plasma Accelerator',
  mc: 'Multi-cannon',
  pl: 'Pulse Laser',
  rg: 'Rail Gun',
  sb: 'Shield Booster',
  tp: 'Torpedo Pylon'
};

let GrpNameToCodeMap = {};

for (let grp in ModuleGroupToName) {
  GrpNameToCodeMap[ModuleGroupToName[grp]] = grp;
}

export const ModuleNameToGroup = GrpNameToCodeMap;

export const MountMap = {
  'F': 'Fixed',
  'G': 'Gimballed',
  'T': 'Turret',
  'Fixed': 'F',
  'Gimballed': 'G',
  'Turret': 'T'
};

export const BulkheadNames = [
  'Lightweight Alloy',
  'Reinforced Alloy',
  'Military Grade Composite',
  'Mirrored Surface Composite',
  'Reactive Surface Composite'
];

/**
 * Array of all Ship properties (facets) organized into groups
 * used for ship comparisons.
 *
 * @type {Array}
 */
export const ShipFacets = [
  {                   // 0
    title: 'agility',
    props: ['agility'],
    unit: '',
    fmt: 'fCrd'
  },
  {                   // 1
    title: 'speed',
    props: ['topSpeed', 'topBoost'],
    lbls: ['thrusters', 'boost'],
    unit: 'm/s',
    fmt: 'fCrd'
  },
  {                   // 2
    title: 'armour',
    props: ['armour'],
    unit: '',
    fmt: 'fCrd'
  },
  {                   // 3
    title: 'shields',
    props: ['shieldStrength'],
    unit: 'MJ',
    fmt: 'fRound'
  },
  {                   // 4
    title: 'jump range',
    props: ['unladenRange', 'fullTankRange', 'ladenRange'],
    lbls: ['max', 'full tank', 'laden'],
    unit: 'LY',
    fmt: 'fRound'
  },
  {                   // 5
    title: 'mass',
    props: ['unladenMass', 'ladenMass'],
    lbls: ['unladen', 'laden'],
    unit: 'T',
    fmt: 'fRound'
  },
  {                   // 6
    title: 'cargo',
    props: ['cargoCapacity'],
    unit: 'T',
    fmt: 'fRound'
  },
  {                   // 7
    title: 'fuel',
    props: ['fuelCapacity'],
    unit: 'T',
    fmt: 'fRound'
  },
  {                   // 8
    title: 'power',
    props: ['powerRetracted', 'powerDeployed', 'powerAvailable'],
    lbls: ['retracted', 'deployed', 'available'],
    unit: 'MW',
    fmt: 'fPwr'
  },
  {                   // 9
    title: 'cost',
    props: ['totalCost'],
    unit: 'CR',
    fmt: 'fCrd'
  },
  {                   // 10
    title: 'total range',
    props: ['unladenTotalRange', 'ladenTotalRange'],
    lbls: ['unladen', 'laden'],
    unit: 'LY',
    fmt: 'fRound'
  },
  {                   // 11
    title: 'DPS',
    props: ['totalDps'],
    lbls: ['DPS'],
    unit: '',
    fmt: 'fRound'
  }
];
  /**
   * Set of all available / theoretical discounts
   */
export const Discounts = {
  '0%': 1,
  '5%': 0.95,
  '10%': 0.90,
  '15%': 0.85,
  '20%': 0.80,
  '25%': 0.75
};

