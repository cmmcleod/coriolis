#2.3.0
  * Add 2.3 diminishing returns on shield value
  * Make scan time visible on scanners where available
  * Update power distributor able-to-boost calculation to take fractional MJ values in to account
  * Revert to floating header due to issues on iOS
  * Add effective total shield value to defence summary
  * Fix issue where new module added to a slot did not reset its enabled status
  * Show integrity value for relevant modules

#2.2.19
  * Power management panel now displays modules in descending order of power usage by default
  * Shot speed can no longer be modified directly.  Its value is derived from the range modifier for Long Range and Focused modifications
  * Ensure that jump range chart updates when fuel slider is changed
  * Add 'Engine profile' and 'FSD profile' charts.  These show how your maximum speed/jump range will alter as you alter the mass of your build
  * Use coriolis-data 2.2.19:
    * Remove shot speed modification - it is directly tied to range
    * Fix incorrect minimal mass for 3C bi-weave shield generator

#2.2.18
  * Change methodology for calculating explorer role; can result in lighter builds
  * Tidy up layout for module selection and lay everything out in a consistent best-to-worst for both class and grade
  * Make integrity for module reinforcement packages visible
  * Clean up breakpoints for modules in available modules list; stops 7- or 8- module long lines
  * Add damager/range graphs to damage dealt
  * Reorder panels
  * Use coriolis-data 2.2.18:
    * Correct lower efficiency value to be better, not worse

#2.2.17
  * Use in-game terminology for shield generator optmul and optmass items
  * Add crew to shipyard and outfitting page information
  * Use coriolis-data 2.2.17:
    * Add mass as potential SCB modification
    * Fix mining laser statistics
    * Remove non-existent grade 4 and 5 wake scanner modifications
    * Add number of crew for each ship

#2.2.16
  * Fix 'Extreme' blueprint roll where some incorrect ranges were chosen
  * Use coriolis-data 2.2.16:
    * Fix incorrect thermal load modifiers for dirty drives
    * Provide explicit information about if values are higher numeric value == better or not

#2.2.15
  * Ensure that standard slots are repainted when any component changes
  * Reload page if Safari throws a security error
  * Handle import of ships with incorrectly-sized slots
  * Add 'Extreme' blueprint roll: best beneficial and worst detrimental outcome (in place of 'Average' roll)
  * Display information about Microsoft browser issues when an import fails
  * Add 'purchase this build' icon link to EDDB
  * Add 'miner' and 'shielded miner' ship roles
  * Use coriolis-data 2.2.15:
    * Fix location of initial cargo rack for Vulture
    * Fix broken regeneration rate for 6B shield generators
    * Tidy up breach damage values

#2.2.14
  * Ensure that jitter is shown correctly when the result of a special effect
  * Use restyled blueprint information
  * Use the ship name (if available) rather than the ship model for the window title
  * Use coriolis-data 2.2.14:
    * Alter blueprint structure to combine components and features
    * Make hidden value of modifications its own attribute
    * Fix incorrect ED ID for class 6 passenger cabins

#2.2.13
  * Add 'time to drain' summary value.  This is the time to drain the WEP capacitor if firing all enabled weapons
  * Do not include utility slot DPS/EPS/HPS in summary information
  * Ensure that auto loader special shows in the tooltip
  * Ensure that ship mass is recalculated when appropriate
  * Use coriolis-data 2.2.13:
    * Add plasma slug special effect for plasma accelerator
    * Tweak hull costs of ships

#2.2.12
  * Tidy up old references to coriolis.io
  * Add ability to add and remove special effects to weapon modifications
  * Add weapon engineering information to Damage Dealt section
  * Change shortcut for link from ctrl-l to ctrl-o to avoid clash with location bar
  * Only show one of power generation or draw in tooltips, according to module
  * Use coriolis-data 2.2.12:
    * Add special effects for each blueprint
    * Add IDs for most Powerplay modules

#2.2.11
  * Add help system and initial help file
  * Make absolute damage visible
  * Add 'average' roll for blueprints
  * Update spacing for movement summary to make it more readable
  * Provide damage dealt statistics for both shields and hull
  * Damage dealt panel only shows enabled weapons
  * Add engagement range to damage received panel
  * Handle burst rate of fire as an absolute number rather than a perentage modification
  * Ensure that clip values are always rounded up
  * Ensure that focused weapon mod uses range modifier to increase falloff as well
  * Use coriolis-data 2.2.11:
    * Remove non-existent chaff launcher capacity blueprint grades
    * Fix incorrect values for charge enhanced power distributor
    * Remove incorrect AFMU blueprints
    * Correct fragment cannon Double Shot blueprint information
    * Correct Focused weapon blueprint information

#2.2.10
  * Fix detailed export of module reinforcement packages
  * Use damagedist for exact breakdown of weapons that have more than one type of damage
  * Use new-style modification validity data
  * Provide ability to select engineering blueprint and roll sample values for them
  * Use coriolis-data 2.2.10:
    * Fix incorrect base shield values for Cutter and Corvette
    * Update weapons to have %-based damage distributions
    * Remove power draw for detailed surface scanner - although shown in outfitting it is not part of active power
    * Fix incorrect names for lightweight and kinetic armour
    * Add engineering blueprints

#2.2.9
  * Use SSL-enabled server for shortlinks
  * Add falloff for weapons
  * Use falloff when calculating weapon effectiveness in damage dealt
  * Add engagement range slider to 'Damage Dealt' section to allow user to see change in weapon effectiveness with range
  * Use better DPE calculation methodology
  * Add total DPS and effectiveness information to 'Damage Dealt' section
  * Use coriolis-data 2.2.9:
    * Add falloff metric for weapons
    * Add falloff from range modification

#2.2.8
  * Fix issue where filling all internals with cargo racks would include restricted slots
  * Use coriolis-data 2.2.8:
    * Set military slot of Viper Mk IV to class 3; was incorrectly set as class 2
    * Update base regeneration rate of prismatic shield generators to values in 2.2.03
    * Update specials with information in 2.2.03

#2.2.7
  * Fix resistance diminishing return calculations
  * Do not allow -100% to be entered as a modification value

#2.2.6
  * Add pitch/roll/yaw information
  * Use combination of pitch, roll and yaw to provide a more useful agility metric
  * Add movement summary to outfitting page
  * Add standard internal class sizes to shipyard page
  * Fix issue when importing Viper Mk IV
  * Ensure ordering of all types of modules (standard, internal, utilities) is consistent
  * Add rebuilds per bay information for fighter hangars
  * Add ability to show military compartments
  * Show module reinforcement package results in defence summary
  * Use separate speed/rotation/acceleration multipliers for thrusters if available
  * Obey restricted slot rules when adding all for internal slots
  * Version URLs to handle changes to ship specifications over time
  * Do not include disabled shield boosters in calculations
  * Add 'Damage dealt' section
  * Add 'Damage received' section
  * Add 'Piercing' information to hardpoints
  * Add 'Hardness' information to ship summary
  * Add module copy functionality - drag module whilst holding 'alt' to copy
  * Add base resistances to defence summary tooltip
  * Update shield recovery/regeneration calculations
  * Pin menu to top of page
  * Switch to custom shortlink method to avoid google length limitations
  * Ensure that information is not lost on narrow screens
  * Do not lose ship selector selection on narrow screens
  * Reinstate jump range graph
  * Use coriolis-data 2.2.6:
    * Update weapons with changed values for 2.2.03
    * Add individual pitch/roll/yaw statistics for each ship
    * Remove old and meaningless agility stat
    * Use sane order for multi-module JSON - coriolis can re-order as it sees fit when displaying modules
    * Fix cost of fighter hangars
    * Update Powerplay weapons with current statistics
    * Add separate min/opt/max multipliers for enhanced thrusters for speed, acceleration and rotation
    * Add module reinforcement packages
    * Add military compartments
    * Fix missing damage value for 2B dumbfires
    * Update shield recharge rates
    * Reduce hull mass of Viper to 50T
    * Fix incorrect optimal mass value for 8A thrusters
    * Add power draw for detailed surface scanner

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
