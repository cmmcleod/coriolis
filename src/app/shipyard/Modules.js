import bulkheads from 'coriolis-data/components/bulkheads';
// Standard Modules
import frame_shift_drive from 'coriolis-data/components/standard/frame_shift_drive';
import fuel_tank from 'coriolis-data/components/standard/fuel_tank';
import life_support from 'coriolis-data/components/standard/life_support';
import power_distributor from 'coriolis-data/components/standard/power_distributor';
import power_plant from 'coriolis-data/components/standard/power_plant';
import sensors from 'coriolis-data/components/standard/sensors';
import thrusters from 'coriolis-data/components/standard/thrusters';
// Hardpoints and Utility modules
import { pl } from 'coriolis-data/components/hardpoints/pulse_laser';
import { ul } from 'coriolis-data/components/hardpoints/burst_laser';
import { bl } from 'coriolis-data/components/hardpoints/beam_laser';
import { mc } from 'coriolis-data/components/hardpoints/multi_cannon';
import { c } from 'coriolis-data/components/hardpoints/cannon';
import { fc } from 'coriolis-data/components/hardpoints/fragment_cannon';
import { rg } from 'coriolis-data/components/hardpoints/rail_gun';
import { pa } from 'coriolis-data/components/hardpoints/plasma_accelerator';
import { mr } from 'coriolis-data/components/hardpoints/missile_rack';
import { tp } from 'coriolis-data/components/hardpoints/torpedo_pylon';
import { nl } from 'coriolis-data/components/hardpoints/mine_launcher';
import { ml } from 'coriolis-data/components/hardpoints/mining_laser';
import { cs } from 'coriolis-data/components/hardpoints/cargo_scanner';
import { cm } from 'coriolis-data/components/hardpoints/countermeasures';
import { ws } from 'coriolis-data/components/hardpoints/frame_shift_wake_scanner';
import { kw } from 'coriolis-data/components/hardpoints/kill_warrant_scanner';
import { sb } from 'coriolis-data/components/hardpoints/shield_booster';
// Internal
import { am } from 'coriolis-data/components/internal/auto_field_maintenance_unit';
import { bsg } from 'coriolis-data/components/internal/bi_weave_shield_generator';
import { cr } from 'coriolis-data/components/internal/cargo_rack';
import { cc } from 'coriolis-data/components/internal/collector_limpet_controllers';
import { dc } from 'coriolis-data/components/internal/docking_computer';
import { fi } from 'coriolis-data/components/internal/frame_shift_drive_interdictor';
import { fs } from 'coriolis-data/components/internal/fuel_scoop';
import { fx } from 'coriolis-data/components/internal/fuel_transfer_limpet_controllers';
import { hb } from 'coriolis-data/components/internal/hatch_breaker_limpet_controller';
import { hr } from 'coriolis-data/components/internal/hull_reinforcement_package';
import { ft } from 'coriolis-data/components/internal/internal_fuel_tank';
import { psg } from 'coriolis-data/components/internal/pristmatic_shield_generator';
import { pc } from 'coriolis-data/components/internal/prospector_limpet_controllers';
import { rf } from 'coriolis-data/components/internal/refinery';
import { sc } from 'coriolis-data/components/internal/scanner';
import { scb } from 'coriolis-data/components/internal/shield_cell_bank';
import { sg } from 'coriolis-data/components/internal/shield_generator';

export default {
  standard: [
    power_plant,
    thrusters,
    frame_shift_drive,
    life_support,
    power_distributor,
    sensors,
    fuel_tank
  ],
  hardpoints: {
    pl,
    ul,
    bl,
    mc,
    c,
    fc,
    rg,
    pa,
    mr,
    tp,
    nl,
    ml,
    cs,
    cm,
    ws,
    kw,
    sb
  },
  internal: {
    am,
    bsg,
    cr,
    cc,
    dc,
    fi,
    fs,
    fx,
    hb,
    hr,
    ft,
    psg,
    pc,
    rf,
    sc,
    scb,
    sg
  },
  bulkheads
};