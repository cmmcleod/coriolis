#2.2.x
  * Update DPS/HPS/EPS in real-time as modifiers change
  * Use coriolis-data 2.2.2:
    * Add distributor draw modifier to shield generators
    * Remove modifiers for sensors
    * Add initial loadout passenger cabins for Beluga
    * Add initial loadout passenger cabins for Orca
    * Update costs and initial loadouts for Keelback and Type-7
    * Add resistances for hull reinforcement packages
    * Added modifier actions to create modifications from raw data
  * Show modification icon for modified modules
  * Take modifications in to account when deciding whether to issue a warning on a standard module
  * Fix hardpoint comparison DPS number when selecting an alternate module
  * Ensure that retrofit tab only shows changed modules
  * Fix import and export of ships with modifications, bump schema version to 4
  * Enable boost display even if power distributor is disabled
  * Calculate breakdown of ship offensive and defensive stats
  * Add 'Offence summary' and 'Defence summary' components
  * Add ability to import directly from companion API output
