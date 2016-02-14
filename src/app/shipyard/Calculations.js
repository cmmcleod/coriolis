
/**
 * Calculate the maximum single jump range based on mass and a specific FSD
 *
 * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
 * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
 * @param  {number} fuel Optional - The fuel consumed during the jump
 * @return {number}      Distance in Light Years
 */
export function jumpRange(mass, fsd, fuel) {
  return Math.pow(Math.min(fuel === undefined ? fsd.maxfuel : fuel, fsd.maxfuel) / fsd.fuelmul, 1 / fsd.fuelpower) * fsd.optmass / mass;
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
  let fuelRemaining = fuel % fsd.maxfuel;  // Fuel left after making N max jumps
  let jumps = Math.floor(fuel / fsd.maxfuel);
  mass += fuelRemaining;
  // Going backwards, start with the last jump using the remaining fuel
  let fastestRange = fuelRemaining > 0 ? Math.pow(fuelRemaining / fsd.fuelmul, 1 / fsd.fuelpower) * fsd.optmass / mass : 0;
  // For each max fuel jump, calculate the max jump range based on fuel mass left in the tank
  for (let j = 0; j < jumps; j++) {
    mass += fsd.maxfuel;
    fastestRange += Math.pow(fsd.maxfuel / fsd.fuelmul, 1 / fsd.fuelpower) * fsd.optmass / mass;
  }
  return fastestRange;
};

/**
 * Calculate the a ships shield strength based on mass, shield generator and shield boosters used.
 *
 * @param  {number} mass       Current mass of the ship
 * @param  {number} shields    Base Shield strength MJ for ship
 * @param  {object} sg         The shield generator used
 * @param  {number} multiplier Shield multiplier for ship (1 + shield boosters if any)
 * @return {number}            Approximate shield strengh in MJ
 */
export function shieldStrength(mass, shields, sg, multiplier) {
  let opt;
  if (mass < sg.minmass) {
    return shields * multiplier * sg.minmul;
  }
  if (mass > sg.maxmass) {
    return shields * multiplier * sg.maxmul;
  }
  if (mass < sg.optmass) {
    opt = (sg.optmass - mass) / (sg.optmass - sg.minmass);
    opt = 1 - Math.pow(1 - opt, 0.87);
    return shields * multiplier * ((opt * sg.minmul) + ((1 - opt) * sg.optmul));
  } else {
    opt = (sg.optmass - mass) / (sg.maxmass - sg.optmass);
    opt = -1 + Math.pow(1 + opt, 2.425);
    return shields * multiplier * ((-1 * opt * sg.maxmul) + ((1 + opt) * sg.optmul));
  }
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
  let multiplier = mass > thrusters.maxmass ? 0 : ((1 - thrusters.M) + (thrusters.M * Math.pow(3 - (2 * Math.max(0.5, mass / thrusters.optmass)), thrusters.P)));
  let speed = baseSpeed * multiplier;

  return {
    '0 Pips': speed * (1 - (pipSpeed * 4)),
    '2 Pips': speed * (1 - (pipSpeed * 2)),
    '4 Pips': speed,
    'boost': baseBoost * multiplier
  };
}
