import Module from './Module';

/**
 * Calculate the maximum single jump range based on mass and a specific FSD
 *
 * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
 * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
 * @param  {number} fuel Optional - The fuel consumed during the jump
 * @return {number}      Distance in Light Years
 */
export function jumpRange(mass, fsd, fuel) {
  let fsdMaxFuelPerJump = fsd instanceof Module ? fsd.getMaxFuelPerJump() : fsd.maxfuel;
  let fsdOptimalMass = fsd instanceof Module ? fsd.getOptMass() : fsd.optmass;
  return Math.pow(Math.min(fuel === undefined ? fsdMaxFuelPerJump : fuel, fsdMaxFuelPerJump) / fsd.fuelmul, 1 / fsd.fuelpower) * fsdOptimalMass / mass;
}

/**
 * Calculate the fastest (total) range based on mass and a specific FSD, and all fuel available
 *
 * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
 * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
 * @param  {number} fuel The total fuel available
 * @return {number}      Distance in Light Years
 */
export function fastestRange(mass, fsd, fuel) {
  let fsdMaxFuelPerJump = fsd instanceof Module ? fsd.getMaxFuelPerJump() : fsd.maxfuel;
  let fsdOptimalMass = fsd instanceof Module ? fsd.getOptMass() : fsd.optmass;
  let fuelRemaining = fuel % fsdMaxFuelPerJump;  // Fuel left after making N max jumps
  let jumps = Math.floor(fuel / fsdMaxFuelPerJump);
  mass += fuelRemaining;
  // Going backwards, start with the last jump using the remaining fuel
  let fastestRange = fuelRemaining > 0 ? Math.pow(fuelRemaining / fsd.fuelmul, 1 / fsd.fuelpower) * fsdOptimalMass / mass : 0;
  // For each max fuel jump, calculate the max jump range based on fuel mass left in the tank
  for (let j = 0; j < jumps; j++) {
    mass += fsd.maxfuel;
    fastestRange += Math.pow(fsdMaxFuelPerJump / fsd.fuelmul, 1 / fsd.fuelpower) * fsdOptimalMass / mass;
  }
  return fastestRange;
};

/**
 * Calculate the a ships shield strength based on mass, shield generator and shield boosters used.
 *
 * @param  {number} mass        Current mass of the ship
 * @param  {number} baseShield  Base Shield strength MJ for ship
 * @param  {object} sg          The shield generator used
 * @param  {number} multiplier  Shield multiplier for ship (1 + shield boosters if any)
 * @return {number}             Approximate shield strengh in MJ
 */
export function shieldStrength(mass, baseShield, sg, multiplier) {
  // sg might be a module or a template; handle either here
  let minMass = sg instanceof Module ? sg.getMinMass() : sg.minmass;
  let optMass = sg instanceof Module ? sg.getOptMass() : sg.optmass;
  let maxMass = sg instanceof Module ? sg.getMaxMass() : sg.maxmass;
  let minMul = sg instanceof Module ? sg.getMinMul() : sg.minmul;
  let optMul = sg instanceof Module ? sg.getOptMul() : sg.optmul;
  let maxMul = sg instanceof Module ? sg.getMaxMul() : sg.maxmul;

  let xnorm = Math.min(1, (maxMass - mass) / (maxMass - minMass));
  let exponent = Math.log((optMul - minMul) / (maxMul - minMul)) / Math.log(Math.min(1, (maxMass - optMass) / (maxMass - minMass)));
  let ynorm = Math.pow(xnorm, exponent);
  let mul = minMul + ynorm * (maxMul - minMul);

  return baseShield * mul * multiplier;
}

/**
 * Calculate the a ships speed based on mass, and thrusters.
 *
 * @param {number}   mass       the mass of the ship
 * @param {number}   baseSpeed  base speed m/s for ship
 * @param {object}   thrusters  The ship's thrusters
 * @param {number}   engpip     the multiplier per pip to engines
 * @return {array}             Speed by pips
 */
export function speed(mass, baseSpeed, thrusters, engpip) {
  // thrusters might be a module or a template; handle either here
  const minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  const optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  const maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  const minMul = thrusters instanceof Module ? thrusters.getMinMul('speed') : (thrusters.minmulspeed ? thrusters.minmulspeed : thrusters.minmul);
  const optMul = thrusters instanceof Module ? thrusters.getOptMul('speed') : (thrusters.optmulspeed ? thrusters.minmulspeed : thrusters.minmul);
  const maxMul = thrusters instanceof Module ? thrusters.getMaxMul('speed') : (thrusters.maxmulspeed ? thrusters.minmulspeed : thrusters.minmul);

  let results = normValues(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseSpeed, engpip);

  return results;
}

/**
 * Calculate pitch of a ship based on mass and thrusters
 * @param {number}   mass       the mass of the ship
 * @param {number}   basePitch  base pitch of the ship
 * @param {object}   thrusters  the ship's thrusters
 * @param {number}   engpip     the multiplier per pip to engines
 * @return {array}             Pitch by pips
 */
export function pitch(mass, basePitch, thrusters, engpip) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  return normValues(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, basePitch, engpip);
}

/**
 * Calculate yaw of a ship based on mass and thrusters
 * @param {number}   mass       the mass of the ship
 * @param {number}   baseYaw    base yaw of the ship
 * @param {object}   thrusters  the ship's thrusters
 * @param {number}   engpip     the multiplier per pip to engines
 * @return {array}             Yaw by pips
 */
export function yaw(mass, baseYaw, thrusters, engpip) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  return normValues(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseYaw, engpip);
}

/**
 * Calculate roll of a ship based on mass and thrusters
 * @param {number}   mass       the mass of the ship
 * @param {number}   baseRoll   base roll of the ship
 * @param {object}   thrusters  the ship's thrusters
 * @param {number}   engpip     the multiplier per pip to engines
 * @return {array}             Roll by pips
 */
export function roll(mass, baseRoll, thrusters, engpip) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  return normValues(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseRoll, engpip);
}

/**
 * Normalise according to FD's calculations and return suitable values
 * @param {number}   minMass  the minimum mass of the thrusters
 * @param {number}   optMass  the optimum mass of the thrusters
 * @param {number}   maxMass  the maximum mass of the thrusters
 * @param {number}   minMul   the minimum multiplier of the thrusters
 * @param {number}   optMul   the optimum multiplier of the thrusters
 * @param {number}   maxMul   the maximum multiplier of the thrusters
 * @param {number}   mass     the mass of the ship
 * @param {base}     base     the base value from which to calculate
 * @param {number}   engpip   the multiplier per pip to engines
 * @return {array}            values by pips
 */
function normValues(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, base, engpip) {
  const xnorm = Math.min(1, (maxMass - mass) / (maxMass - minMass));
  const exponent = Math.log((optMul - minMul) / (maxMul - minMul)) / Math.log(Math.min(1, (maxMass - optMass) / (maxMass - minMass)));
  const ynorm = Math.pow(xnorm, exponent);
  const mul = minMul + ynorm * (maxMul - minMul);
  const res = base * mul;

  return [res * (1 - (engpip * 4)),
          res * (1 - (engpip * 3)),
	  res * (1 - (engpip * 2)),
	  res * (1 - (engpip * 1)),
	  res];
}

function calcValue(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, base, engpip, eng) {
  const xnorm = Math.min(1, (maxMass - mass) / (maxMass - minMass));
  const exponent = Math.log((optMul - minMul) / (maxMul - minMul)) / Math.log(Math.min(1, (maxMass - optMass) / (maxMass - minMass)));
  const ynorm = Math.pow(xnorm, exponent);
  const mul = minMul + ynorm * (maxMul - minMul);
  const res = base * mul;

  return res * (1 - (engpip * (4 - eng)));
}

export function calcSpeed(mass, baseSpeed, thrusters, engpip, eng, boostFactor, boost) {
  // thrusters might be a module or a template; handle either here
  const minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  const optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  const maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  const minMul = thrusters instanceof Module ? thrusters.getMinMul('speed') : (thrusters.minmulspeed ? thrusters.minmulspeed : thrusters.minmul);
  const optMul = thrusters instanceof Module ? thrusters.getOptMul('speed') : (thrusters.optmulspeed ? thrusters.minmulspeed : thrusters.minmul);
  const maxMul = thrusters instanceof Module ? thrusters.getMaxMul('speed') : (thrusters.maxmulspeed ? thrusters.minmulspeed : thrusters.minmul);

  let result = calcValue(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseSpeed, engpip, eng);
  if (boost == true) {
    result *= boostFactor;
  }

  return result;
}

export function calcPitch(mass, basePitch, thrusters, engpip, eng, boostFactor, boost) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  let result = calcValue(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, basePitch, engpip, eng);
  if (boost == true) {
    result *= boostFactor;
  }

  return result;
}

export function calcRoll(mass, baseRoll, thrusters, engpip, eng, boostFactor, boost) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  let result = calcValue(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseRoll, engpip, eng);
  if (boost == true) {
    result *= boostFactor;
  }

  return result;
}

export function calcYaw(mass, baseYaw, thrusters, engpip, eng, boostFactor, boost) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul('rotation') : (thrusters.minmulrotation ? thrusters.minmulrotation : thrusters.minmul);
  let optMul = thrusters instanceof Module ? thrusters.getOptMul('rotation') : (thrusters.optmulrotation ? thrusters.optmulrotation : thrusters.optmul);
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul('rotation') : (thrusters.maxmulrotation ? thrusters.maxmulrotation : thrusters.maxmul);

  let result = calcValue(minMass, optMass, maxMass, minMul, optMul, maxMul, mass, baseYaw, engpip, eng);
  if (boost == true) {
    result *= boostFactor;
  }

  return result;
}

