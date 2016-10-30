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
  let fsdOptimalMass = fsd instanceof Module ? fsd.getOptimalMass() : fsd.optmass;
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
  let fsdOptimalMass = fsd instanceof Module ? fsd.getOptimalMass() : fsd.optmass;
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
  let exponent = Math.log((optMul - minMul) / (maxMul - minMul)) / Math.log(Math.min(1, (maxMass - optMass) / (maxMass - minMass)))
  let ynorm = Math.pow(xnorm, exponent);
  let mul = minMul + ynorm * (maxMul - minMul);
  let strength = baseShield * mul;

  // TODO handle multiplier

  return strength;
}

/**
 * Calculate the a ships speed based on mass, and thrusters.
 *
 * @param  {number} mass        Current mass of the ship
 * @param  {number} baseSpeed   Base speed m/s for ship
 * @param  {number} baseBoost   Base boost speed m/s for ship
 * @param  {object} thrusters   The Thrusters used
 * @param  {number} pipSpeed    Speed pip multiplier
 * @return {object}             Approximate speed by pips
 */
export function speed(mass, baseSpeed, baseBoost, thrusters, pipSpeed) {
  // thrusters might be a module or a template; handle either here
  let minMass = thrusters instanceof Module ? thrusters.getMinMass() : thrusters.minmass;
  let optMass = thrusters instanceof Module ? thrusters.getOptMass() : thrusters.optmass;
  let maxMass = thrusters instanceof Module ? thrusters.getMaxMass() : thrusters.maxmass;
  let minMul = thrusters instanceof Module ? thrusters.getMinMul() : thrusters.minmul;
  let optMul = thrusters instanceof Module ? thrusters.getOptMul() : thrusters.optmul;
  let maxMul = thrusters instanceof Module ? thrusters.getMaxMul() : thrusters.maxmul;

  let xnorm = Math.min(1, (maxMass - mass) / (maxMass - minMass));
  let exponent = Math.log((optMul - minMul) / (maxMul - minMul)) / Math.log(Math.min(1, (maxMass - optMass) / (maxMass - minMass)))
  let ynorm = Math.pow(xnorm, exponent);
  let mul = minMul + ynorm * (maxMul - minMul);
  let speed = baseSpeed * mul;

  return {
    '0 Pips': speed * (1 - (pipSpeed * 4)),
    '2 Pips': speed * (1 - (pipSpeed * 2)),
    '4 Pips': speed,
    'boost': baseBoost * mul
  };
}
