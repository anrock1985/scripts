let creepConstructor = {
    construct: function (spawner) {
        let debug = true;

        let _ = require('lodash');

        // Harvester
        if (spawner.isActive()
            && !spawner.spawning
            && spawner.room.energyAvailable >= 250 && Memory.harvesters < 2) {
            let name = Game.time + "_H";
            if (Memory.carry > 1) {
                let resultCode = spawner.spawnCreep([WORK, WORK, MOVE], name, {memory: {role: "harvester"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning DROP HARVESTER result code: " + resultCode);
                    return;
                }
            } else {
                let resultCode = spawner.spawnCreep([WORK, CARRY, MOVE], name, {memory: {role: "harvester"}});
                if (resultCode !== 0) {
                    console.log("ERROR: Spawning CARRY HARVESTER result code: " + resultCode);
                    return;
                }
            }
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
                let resultCode = spawner.spawnCreep([WORK, CARRY, MOVE], name, {memory: {role: "upgrader"}});
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
                let resultCode = spawner.spawnCreep([CARRY, MOVE, MOVE], name, {memory: {role: "carry"}});
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
                let resultCode = spawner.spawnCreep([WORK, WORK, CARRY, MOVE], name, {memory: {role: "builder"}});
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
                let resultCode = spawner.spawnCreep([WORK, WORK, CARRY, MOVE], name, {memory: {role: "repairer"}});
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
    },

    prepareBody: function (spawner) {
        let totalAvailableEnergy = spawner.room.energyAvailable;
    }
};

module.exports = creepConstructor;