#2.2.6
  * Add pitch/roll/yaw information
  * Use combination of pitch, roll and yaw to provide a more useful agility metric
  * Add movement summary to outfitting page
  * Add standard internal class sizes to shipyard page
  * Fix issue when importing Viper Mk IV
  * Ensure ordering of all types of modules (standard, internal, utilities) is consistent
  * Add rebuilds per bay information for fighter hangars
  * Add ability to show military compartments
  * Add diminishing returns for shield boosters
  * Show module reinforcement package results in defence summary
  * Use separate speed/rotation/acceleration multipliers for thrusters if available
  * Obey restricted slot rules when adding all for internal slots
  * Version URLs to handle changes to ship specifications over time

#2.2.5
  * Calculate rate of fire for multi-burst weapons
  * Add note to disable ghostery in error situation
  * Use coriolis-data 2.2.5:
    * Fix incorrect ID for emissive munitions special
    * Fix rate of fire for burst lasers
    * Add fragment cannon modifications
    * Fix internal name of dazzle shell

#2.2.4
  * Add shortlink for outfitting page
  * Use coriolis-data 2.2.4:
    * Fix incorrect ID for class 5 luxury passenger cabin
    * Add damage type modifier
    * Change modifications from simple strings to objects, to allow more data-driven behaviour
    * Add special effects
  * Modification tooltip now shows special effect

#2.2.3
  * Fix hull boost calculation - now shows correct % modifier and total armour
  * Fix import of DiamondBack - can now be imported
  * Fix import of Beluga - can now be imported
  * Use coriolis-data 2.2.3:
    * Fix mismatch between class 5 and class 7 fighter hangars - now shows correct module
    * Add details for concordant sequence special effect - now shows correct damage
    * Fix details for thermal shock special effect - now shows correct damage
    * Add engineer blueprints
  * Modification tooltip now shows name and grade of modifications for imported builds
  * Retain import URL unless user changes the build - allows future updates of Coriolis to take advantage of additional build information

#2.2.2
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
  * Add ability to import from companion API output through import feature
  * Add ability to import from companion API output through URL
