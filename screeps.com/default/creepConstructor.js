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

        function prepareBody(spawner, role) {
            let totalAvailableEnergy = spawner.room.energyAvailable;
            let result = [];
            if (totalAvailableEnergy >= 200) {
                let count = 1;
                switch (role) {
                    case "harvester":
                        for (count = 1; count <= 2; count++) {
                            result.push(MOVE);
                        }
                        totalAvailableEnergy -= (BODYPART_COST.move * count);

                        for (count = 1; count <= 1; count++) {
                            result.push(CARRY);
                        }
                        totalAvailableEnergy -= (BODYPART_COST.carry * count);

                        for (count = 1; count <= Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                            result.push(WORK);
                        }
                        break;

                    case "carry":
                        for (count = 1; count <= 2; count++) {
                            result.push(MOVE);
                        }
                        totalAvailableEnergy -= (BODYPART_COST.move * count);

                        for (count = 1; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.carry); count++) {
                            result.push(CARRY);
                        }
                        break;

                    case "upgrader":
                    case "builder":
                    case "repairer":
                        for (count = 1; count <= 2; count++) {
                            result.push(MOVE);
                        }
                        totalAvailableEnergy -= (BODYPART_COST.move * count);

                        for (count = 1; count <= Math.trunc(totalAvailableEnergy / 2); count++) {
                            result.push(CARRY);
                        }
                        totalAvailableEnergy -= (BODYPART_COST.carry * count);

                        for (count = 1; count <= Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                            result.push(WORK);
                        }
                        break;
                }
            }
            return result;
        }

        // Harvester
        if (spawner.isActive()
            && !spawner.spawning
            && spawner.room.energyAvailable >= 250 && Memory.harvesters < 2) {
            let name = Game.time + "_H";
            if (Memory.carry > 1) {
                let resultCode = spawner.spawnCreep(prepareBody(spawner, "harvester"), name, {memory: {role: "harvester"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning DROP HARVESTER result code: " + resultCode);
                    return;
                }
            } /*else {
                let resultCode = spawner.spawnCreep([WORK, CARRY, MOVE], name, {memory: {role: "harvester"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning CARRY HARVESTER result code: " + resultCode);
                    return;
                }
            }*/
            Memory.harvesters++;
            let bodyParts = [];
            _.forEach(Game.creeps[name].body, function (item) {
                bodyParts.push(item.type.toString().toUpperCase());
            });
            if (debug) {
                console.log("INFO: new HARVESTER [total:" + Memory.harvesters + "] (" + bodyParts + ") TTL:" + Game.creeps[name].ticksToLive);
            }
        }

        if (Memory.harvesters > 1) {
            //Upgrader
            if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 200
                && Memory.harvesters > 0 && Memory.upgraders < 2) {
                let name = Game.time + "_U";
                let resultCode = spawner.spawnCreep(prepareBody(spawner, "upgrader"), name, {memory: {role: "upgrader"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning UPGRADER result code: " + resultCode);
                    return;
                }
                Memory.upgraders++;
                let bodyParts = [];
                _.forEach(Game.creeps[name].body, function (item) {
                    bodyParts.push(item.type.toString().toUpperCase());
                });
                if (debug) {
                    console.log("INFO: new UPGRADER [total:" + Memory.upgraders + "] (" + bodyParts + ") TTL:" + Game.creeps[name].ticksToLive);
                }
            }

            //Carry
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 150
                && Memory.harvesters > 1 && Memory.carry < 12) {
                let name = Game.time + "_C";
                let resultCode = spawner.spawnCreep(prepareBody(spawner, "carry"), name, {memory: {role: "carry"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning CARRY result code: " + resultCode);
                    return;
                }
                Memory.carry++;
                let bodyParts = [];
                _.forEach(Game.creeps[name].body, function (item) {
                    bodyParts.push(item.type.toString().toUpperCase());
                });
                if (debug) {
                    console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ") TTL:" + Game.creeps[name].ticksToLive);
                }
            }

            //Builder
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.memory.myConstructionSiteIds.length > 0
                && spawner.room.energyAvailable >= 300
                && Memory.harvesters > 1 && Memory.upgraders > 0 && Memory.builders < 1) {
                let name = Game.time + "_B";
                let resultCode = spawner.spawnCreep(prepareBody(spawner, "builder"), name, {memory: {role: "builder"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning BUILDER result code: " + resultCode);
                    return;
                }
                Memory.builders++;
                let bodyParts = [];
                _.forEach(Game.creeps[name].body, function (item) {
                    bodyParts.push(item.type.toString().toUpperCase());
                });
                if (debug) {
                    console.log("INFO: new BUILDER [total:" + Memory.builders + "] (" + bodyParts + ") TTL:" + Game.creeps[name].ticksToLive);
                }
            }

            //Repairer
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && Memory.harvesters > 1 && Memory.upgraders > 0 && Memory.repairers < 1) {
                let name = Game.time + "_R";
                let resultCode = spawner.spawnCreep(prepareBody(spawner, "repairer"), name, {memory: {role: "repairer"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning REPAIRER result code: " + resultCode);
                    return;
                }
                Memory.repairers++;
                let bodyParts = [];
                _.forEach(Game.creeps[name].body, function (item) {
                    bodyParts.push(item.type.toString().toUpperCase());
                });
                if (debug) {
                    console.log("INFO: new REPAIRER [total:" + Memory.repairers + "] (" + bodyParts + ") TTL:" + Game.creeps[name].ticksToLive);
                }
            }
        }
    }
};

module.exports = creepConstructor;