let populationController = {

    check: function (room) {

        let debug = true;

        let _ = require('lodash');

        let roleHarvester = require('role.harvester');
        let roleUpgrader = require('role.upgrader');
        let roleBuilder = require('role.builder');
        let roleCarry = require('role.carry');
        let roleRepairer = require('role.repairer');
        let roleScout = require('role.scout');
        let roleDeadman = require('role.deadman');
        let roleWarrior = require('role.warrior');
        let creepConstructor = require('creepConstructor');
        let spawnHelper = require('spawnHelper');

        let mainSpawnerId = Game.spawns["Spawn1"].id;
        let initPeriod = 100;

        if (_.isEmpty(Game.creeps)) {
            console.log("--- CRIT: Game.creeps is empty! ---");
            initRoles(true);
        } else {
            if (Game.time % initPeriod === 0) {
                console.log("[T:" + Game.time + "] INFO: " + room.name + " Starting periodic init");
                initRoles(false);
            }
        }

        checkHarvesters();

        for (let c in Memory.creeps) {
            if (!Game.creeps[c]) {
                Memory.deadTotal++;
                if (Memory.creeps[c].carriedEnergy > 0) {
                    Memory.deadWithCarry++;
                    if (Memory.topEnergyLoss === undefined) {
                        Memory.topEnergyLoss = 0;
                    }
                    if (parseInt(Memory.topEnergyLoss) < parseInt(Memory.creeps[c].carriedEnergy)) {
                        Memory.topEnergyLoss = Memory.creeps[c].carriedEnergy;
                    }
                    Memory.lostEnergy += parseInt(Memory.creeps[c].carriedEnergy);
                }
                Memory.deadWithCarryPercent = Memory.deadTotal === 0 ? 0 : Math.trunc(((Memory.deadWithCarry / Memory.deadTotal) * 100));
                if (debug) {
                    if (Memory.creeps[c].name) {
                        console.log("INFO: RIP " + Memory.creeps[c].name + ". "
                            + Memory.deadWithCarryPercent + "% of " + Memory.deadTotal
                            + " died creeps has energy carried. Energy losses are "
                            + Memory.lostEnergy + ". Top: " + Memory.topEnergyLoss
                            + ". Latest: " + ((Memory.creeps[c].carriedEnergy === undefined) ? 0 : Memory.creeps[c].carriedEnergy));
                    } else {
                        console.log("WARN: Creep disappeared!");
                    }
                }
                if (Memory.deadTotal >= 100) {
                    Memory.deadTotal = 0;
                    Memory.deadWithCarry = 0;
                    Memory.topEnergyLoss = 0;
                    Memory.deadWithCarryPercent = 0;
                    Memory.lostEnergy = 0;
                }
                delete Memory.creeps[c];
            }
        }

        for (let c in room.memory.creeps) {
            let creepId = room.memory.creeps[c];
            let creep = Game.getObjectById(creepId);

            if (!creep.spawning) {

                if (creep.ticksToLive === 3) {
                    roleDeadman.assign(creep);
                }

                if ((creep.ticksToLive === 1) && (creep.store[RESOURCE_ENERGY] > 0)) {
                    creep.memory.carriedEnergy = creep.store[RESOURCE_ENERGY];
                }

                if (creep.memory.newRole) {
                    creep.memory.role = creep.memory.newRole;
                    creep.memory.newRole = undefined;
                }

                if (creep.memory.role === "harvester") {
                    if (creep.ticksToLive === 50
                        && !spawnHelper.isSpawnLocked(creep.room)
                        && creep.room.memory.harvesters > 0 && creep.room.memory.harvesters <= creep.room.memory.sourceIds.length
                        && !Game.getObjectById(mainSpawnerId).spawning) {
                        console.log("--- WARN: " + creep.room.name + " Spawn lock (by TTL) requested by " + creep.name
                            + " (" + creep.memory.role.toUpperCase()
                            + "), TTL:" + creep.ticksToLive + " ---");
                        spawnHelper.lockSpawn(creep.room);
                    }
                    if (!spawnHelper.isSpawnLocked(creep.room)
                        && creep.room.memory.harvesters > 0
                        && creep.room.memory.harvesters < creep.room.memory.sourceIds.length
                        && !Game.getObjectById(mainSpawnerId).spawning) {
                        console.log("--- WARN: " + creep.room.name + " Spawn lock (by Limit) requested by " + creep.name
                            + " (" + creep.memory.role.toUpperCase()
                            + "), TTL:" + creep.ticksToLive + " ---");
                        spawnHelper.lockSpawn(creep.room);
                    }
                    roleHarvester.run(creep);
                }

                if (creep.memory.role === "upgrader") {
                    roleUpgrader.run(creep);
                }

                if (creep.memory.role === "carry") {
                    roleCarry.run(creep);
                }

                if (creep.memory.role === "builder") {
                    roleBuilder.run(creep);
                }

                if (creep.memory.role === "repairer") {
                    roleRepairer.assign(creep);
                }

                if (creep.memory.role === "scout") {
                    roleScout.assign(creep);
                }

                if (creep.memory.role === "warrior") {
                    roleWarrior.assign(creep);
                }

                if (creep.memory.role === "deadman") {
                    roleDeadman.assign(creep);
                }

                if (!creep.memory.role
                    && _.filter(creep.body, (body) => body.type = WORK)
                    && _.filter(creep.body, (body) => body.type = CARRY)
                    && _.filter(creep.body, (body) => body.type = MOVE)) {
                    creep.memory.role = "harvester";
                    room.memory.harvesters++;
                    //TODO: Creep body toString fix.
                    console.log("WARN: Lost creep recovered. He is " + creep.memory.role.toUpperCase() + " now. (" + creep.body.toString() + ")")
                }

                if (creep.memory.idle) {
                    Memory.flags = Game.flags;
                    creep.moveTo(Game.flags["Idle"]);
                }
            }
        }

        creepConstructor.construct(Game.getObjectById(mainSpawnerId));

        function checkHarvesters() {
            let currentHarvesters = 0;
            let currentCarry = 0;
            let currentUpgraders = 0;
            let currentBuilders = 0;
            let currentRepairers = 0;
            let currentScouts = 0;
            let currentWarriors = 0;
            let currentClaimers = 0;

            if (room.memory.creeps.length !== 0) {
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "harvester") {
                        currentHarvesters++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "carry") {
                        currentCarry++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "upgrader") {
                        currentUpgraders++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "builder") {
                        currentBuilders++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "repairer") {
                        currentRepairers++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "scout") {
                        currentScouts++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "warrior") {
                        currentWarriors++;
                    }
                    if (Game.getObjectById(creepId).memory.role === "claimer") {
                        currentClaimers++;
                    }
                }
                if (currentHarvesters !== room.memory.harvesters) {
                    console.log("--- WARN: HARVESTER roles mismatch. Actual:" + currentHarvesters + "Memory:" + room.memory.harvesters + " ---");
                    initRoles(true);
                } else if (currentCarry !== room.memory.carrys) {
                    console.log("--- WARN: CARRY roles mismatch. Actual:" + currentCarry + "Memory:" + room.memory.carrys + " ---");
                    initRoles(true);
                } else if (currentUpgraders !== room.memory.upgraders) {
                    console.log("--- WARN: UPGRADER roles mismatch. Actual:" + currentUpgraders + "Memory:" + room.memory.upgraders + " ---");
                    initRoles(true);
                } else if (currentBuilders !== room.memory.builders) {
                    console.log("--- WARN: BUILDER roles mismatch. Actual:" + currentBuilders + "Memory:" + room.memory.builders + " ---");
                    initRoles(true);
                } else if (currentRepairers !== room.memory.repairers) {
                    console.log("--- WARN: REPAIRER roles mismatch. Actual:" + currentRepairers + "Memory:" + room.memory.repairers + " ---");
                    initRoles(true);
                } else if (currentScouts !== room.memory.scouts) {
                    console.log("--- WARN: SCOUT roles mismatch. Actual:" + currentScouts + "Memory:" + room.memory.scouts + " ---");
                    initRoles(true);
                } else if (currentWarriors !== room.memory.warriors) {
                    console.log("--- WARN: WARRIOR roles mismatch. Actual:" + currentWarriors + "Memory:" + room.memory.warriors + " ---");
                    initRoles(true);
                } else if (currentClaimers !== room.memory.claimers) {
                    console.log("--- WARN: CLAIMER roles mismatch. Actual:" + currentClaimers + "Memory:" + room.memory.claimers + " ---");
                    initRoles(true);
                }
            }
        }

        function initRoles(forceInit) {
            //Harvester
            if (room.memory.harvesters.length > 0 || forceInit) {
                if (!room.memory.harvesters) {
                    console.log("--- WARN: room.memory.harvesters was undefined! ---")
                }
                room.memory.harvesters = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "harvester") {
                        room.memory.harvesters++;
                    }
                }
            }

            //Carry
            if (room.memory.carrys.length > 0 || forceInit) {
                if (!room.memory.carrys) {
                    console.log("--- WARN: room.memory.carrys was undefined! ---")
                }
                room.memory.carrys = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "carry") {
                        room.memory.carrys++;
                    }
                }
            }

            //Upgrader
            if (room.memory.upgraders.length > 0 || forceInit) {
                if (!room.memory.upgraders) {
                    console.log("--- WARN: room.memory.upgraders was undefined! ---")
                }
                room.memory.upgraders = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "upgrader") {
                        room.memory.upgraders++;
                    }
                }
            }

            //Builder
            if (room.memory.builders.length > 0 || forceInit) {
                if (!room.memory.builders) {
                    console.log("--- WARN: room.memory.builders was undefined! ---")
                }
                room.memory.builders = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "builder") {
                        room.memory.builders++;
                    }
                }
            }

            //Repairer
            if (room.memory.repairers.length > 0 || forceInit) {
                if (!room.memory.repairers) {
                    console.log("--- WARN: room.memory.repairers was undefined! ---")
                }
                room.memory.repairers = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "repairer") {
                        room.memory.repairers++;
                    }
                }
            }

            //Scout
            if (room.memory.scouts.length > 0 || forceInit) {
                if (!room.memory.scouts) {
                    console.log("--- WARN: room.memory.scouts was undefined! ---")
                }
                room.memory.scouts = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "scout") {
                        room.memory.scouts++;
                    }
                }
            }

            //Warrior
            if (room.memory.warriors.length > 0 || forceInit) {
                if (!room.memory.warriors) {
                    console.log("--- WARN: room.memory.warriors was undefined! ---")
                }
                room.memory.warriors = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "warrior") {
                        room.memory.warriors++;
                    }
                }
            }

            //Claimer
            if (room.memory.claimers.length > 0 || forceInit) {
                if (!room.memory.claimers) {
                    console.log("--- WARN: room.memory.warriors was undefined! ---")
                }
                room.memory.claimers = 0;
                for (let c in room.memory.creeps) {
                    let creepId = room.memory.creeps[c];
                    if (Game.getObjectById(creepId).memory.role === "claimer") {
                        room.memory.claimers++;
                    }
                }
            }
            console.log("[T:" + Game.time
                + "] INFO: " + room.name + " Initialization complete. Founded [H:"
                + room.memory.harvesters + " U:" + room.memory.upgraders + " C:" + room.memory.carrys +
                " B:" + room.memory.builders + " R:" + room.memory.repairers + " S:" + room.memory.scouts + " W:" + room.memory.warriors + " CL:" + room.memory.claimers + "]")
        }
    }
};

module.exports = populationController;

//TODO: Разметка дороги по кратчайшему пути, кэширование дороги чтобы не дергать патфайндер.
// Асфальтирование кэшированной дороги.

//TODO: Расчет необходимого количества carry в зависимости от длины пути и скорости добычи.