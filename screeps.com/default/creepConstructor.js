// MOVE	50	Decreases fatigue by 2 points per tick.
//     WORK	100
// Harvests 2 energy units from a source per tick.
//
//     Harvests 1 resource unit from a mineral or a deposit per tick.
//
//     Builds a structure for 5 energy units per tick.
//
//     Repairs a structure for 100 hits per tick consuming 1 energy unit per tick.
//
//     Dismantles a structure for 50 hits per tick returning 0.25 energy unit per tick.
//
//     Upgrades a controller for 1 energy unit per tick.
//
//     CARRY	50	Can contain up to 50 resource units.
//     ATTACK	80	Attacks another creep/structure with 30 hits per tick in a short-ranged attack.
//     RANGED_ATTACK	150
// Attacks another single creep/structure with 10 hits per tick in a long-range attack up to 3 squares long.
//
//     Attacks all hostile creeps/structures within 3 squares range with 1-4-10 hits (depending on the range).
//
// HEAL	250	Heals self or another creep restoring 12 hits per tick in short range or 4 hits per tick at a distance.
//     CLAIM	600
// Claims a neutral room controller.
//
//     Reserves a neutral room controller for 1 tick per body part.
//
//     Attacks a hostile room controller downgrading its timer by 300 ticks per body parts.
//
//     Attacks a neutral room controller reservation timer by 1 tick per body parts.
//
//     A creep with this body part will have a reduced life time of 600 ticks and cannot be renewed.
//
//     TOUGH	10	No effect, just additional hit points to the creep's body. Can be boosted to resist damage.

let creepConstructor = {
    construct: function (spawner) {
        let debug = true;

        let _ = require('lodash');

        let totalAvailableEnergy = spawner.room.energyAvailable;

        function prepareBody(role) {
            let result = [];
            let count = 0;
            switch (role) {
                case "defaultHarvester":
                    for (count = 0; count < 1; count++) {
                        result.push(MOVE);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.move * count);

                    for (count = 0; count < 1; count++) {
                        result.push(CARRY);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.carry * count);

                    for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                        result.push(WORK);
                    }
                    break;

                case "harvester":
                    for (count = 0; count < 1; count++) {
                        result.push(MOVE);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.move * count);
                    console.log("totalAvailableEnergy after MOVE:" + totalAvailableEnergy + ", count:" + count);
                    console.log("For (WORK):" + Math.trunc(totalAvailableEnergy / BODYPART_COST.work));
                    for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                        if (result.length === 50)
                            break;
                        result.push(WORK);
                        if (count > 3)
                            break;
                    }
                    totalAvailableEnergy -= (BODYPART_COST.work * count);
                    console.log("totalAvailableEnergy after WORK:" + totalAvailableEnergy + ", count:" + count);
                    if (totalAvailableEnergy >= 50) {
                        for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.move); count++) {
                            if (result.length === 50)
                                break;
                            result.push(MOVE);
                            if (count > 4)
                                break;
                        }
                    }
                    break;

                case "carry":
                    while (totalAvailableEnergy >= 100) {
                        if (result.length === 50)
                            break;
                        result.push(MOVE);
                        result.push(CARRY);
                        totalAvailableEnergy -= (BODYPART_COST.move + BODYPART_COST.carry);
                    }
                    break;

                case "upgrader":
                case "builder":
                case "repairer":
                    for (count = 0; count < 2; count++) {
                        result.push(MOVE);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.move * count);

                    for (count = 0; count < Math.trunc(Math.trunc(totalAvailableEnergy / 2) / BODYPART_COST.carry); count++) {
                        if (result.length === 50)
                            break;
                        if (spawner.room.energyCapacityAvailable <= ((50 * count) - 50)) {
                            if (debug)
                                console.log("WARN: Carry capacity limit reached");
                            break;
                        }
                        result.push(CARRY);

                    }
                    totalAvailableEnergy -= (BODYPART_COST.carry * count);

                    for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                        result.push(WORK);
                    }
                    break;
            }
            return result;
        }

        if (Memory.harvesters < 1) {
            console.log("WARN: No harvesters found in room " + spawner.room.name + "!");
            if (spawner.room.memory.droppedEnergyIds && Memory.carry < 2) {
                for (let e in spawner.room.memory.droppedEnergyIds) {
                    if (Game.getObjectById(spawner.room.memory.droppedEnergyIds[e]).amount >= 500) {
                        //Default Carry
                        if (spawner.isActive()
                            && !spawner.spawning
                            && spawner.room.energyAvailable >= 300 && Memory.carry < 2) {
                            let name = Game.time + "_C";
                            let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});

                            if (resultCode === 0) {
                                Memory.carry++;
                                let bodyParts = [];
                                _.forEach(Game.creeps[name].body, function (item) {
                                    bodyParts.push(item.type.toString().toUpperCase());
                                });
                                if (debug) {
                                    console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                                }
                            } else {
                                console.log("ERROR: Spawning CARRY result code: " + resultCode);
                            }
                        }
                    }
                }
            } else {
                // Default Harvester
                if (spawner.isActive()
                    && !spawner.spawning
                    && spawner.room.energyAvailable >= 300) {
                    let name = Game.time + "_H";
                    let resultCode = spawner.spawnCreep(prepareBody("defaultHarvester"), name, {memory: {role: "harvester"}});
                    if (resultCode === 0) {
                        Memory.harvesters++;
                        let bodyParts = [];
                        _.forEach(Game.creeps[name].body, function (item) {
                            bodyParts.push(item.type.toString().toUpperCase());
                        });
                        if (debug) {
                            console.log("INFO: new HARVESTER [total:" + Memory.harvesters + "] (" + bodyParts + ")");
                        }
                    } else {
                        console.log("ERROR: Spawning HARVESTER result code: " + resultCode);
                    }
                }
            }
        } else {
            //Carry
            if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable && Memory.carry < 2) {
                let name = Game.time + "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});

                if (resultCode === 0) {
                    Memory.carry++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning CARRY result code: " + resultCode);
                }
            }

            // Harvester
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable && Memory.harvesters < 2) {
                let name = Game.time + "_H";
                if (Memory.carry > 1) {
                    let resultCode = spawner.spawnCreep(prepareBody("harvester"), name, {memory: {role: "harvester"}});
                    if (resultCode === 0) {
                        Memory.harvesters++;
                        let bodyParts = [];
                        _.forEach(Game.creeps[name].body, function (item) {
                            bodyParts.push(item.type.toString().toUpperCase());
                        });
                        if (debug) {
                            console.log("INFO: new HARVESTER [total:" + Memory.harvesters + "] (" + bodyParts + ")");
                        }
                    } else {
                        console.log("ERROR: Spawning HARVESTER result code: " + resultCode);
                    }
                }
            }

            //Upgrader
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable
                && Memory.upgraders < ((spawner.room.memory.myConstructionSiteIds.length === 0) ? 6 : 2)) {
                let name = Game.time + "_U";
                let resultCode = spawner.spawnCreep(prepareBody("upgrader"), name, {memory: {role: "upgrader"}});

                if (resultCode === 0) {
                    Memory.upgraders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new UPGRADER [total:" + Memory.upgraders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning UPGRADER result code: " + resultCode);
                }
            }

            //Carry
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable && Memory.carry < 8) {
                let name = Game.time + "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});

                if (resultCode === 0) {
                    Memory.carry++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning CARRY result code: " + resultCode);
                }
            }

            //Builder
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.memory.myConstructionSiteIds.length > 0
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable
                && Memory.builders < ((spawner.room.memory.myConstructionSiteIds.length > 2) ? 2 : 1)) {
                let name = Game.time + "_B";
                let resultCode = spawner.spawnCreep(prepareBody("builder"), name, {memory: {role: "builder"}});

                if (resultCode === 0) {
                    Memory.builders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new BUILDER [total:" + Memory.builders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning BUILDER result code: " + resultCode);
                }
            }

            //Repairer
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable === spawner.room.energyCapacityAvailable && Memory.repairers < 1) {
                let name = Game.time + "_R";
                let resultCode = spawner.spawnCreep(prepareBody("repairer"), name, {memory: {role: "repairer"}});

                if (resultCode === 0) {
                    Memory.repairers++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new REPAIRER [total:" + Memory.repairers + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning REPAIRER result code: " + resultCode);
                }
            }
        }
    }
};

module.exports = creepConstructor;