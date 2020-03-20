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
            console.log("--- WARN: Game.creeps is empty! ---");
            initRoles(true);
        } else {
            if (Game.time % initPeriod === 0) {
                console.log("[T:" + Game.time + "] INFO: Starting periodic init");
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

        for (let c in Game.creeps) {
            let creep = Game.creeps[c];

            if (!creep.spawning) {

                if (creep.ticksToLive === 3) {
                    roleDeadman.assign(creep);
                }

                if ((creep.ticksToLive === 1) && (creep.store[RESOURCE_ENERGY] > 0)) {
                    creep.memory.carriedEnergy = creep.store[RESOURCE_ENERGY];
                }

                creep.memory.currentRoomName = creep.room.name;

                if (creep.memory.newRole) {
                    creep.memory.role = creep.memory.newRole;
                    creep.memory.newRole = undefined;
                }

                if (creep.memory.role === "harvester") {
                    if (creep.ticksToLive === 50
                        && !spawnHelper.isSpawnLocked(creep.room)
                        && Memory.harvesters > 0 && Memory.harvesters <= creep.room.memory.sourceIds.length
                        && !Game.getObjectById(mainSpawnerId).spawning) {
                        console.log("--- WARN: Spawn lock (by TTL) requested by " + creep.name
                            + " (" + creep.memory.role.toUpperCase()
                            + "), TTL:" + creep.ticksToLive + " ---");
                        spawnHelper.lockSpawn(creep.room);
                    }
                    if (!spawnHelper.isSpawnLocked(creep.room)
                        && Memory.harvesters > 0
                        && Memory.harvesters < creep.room.memory.sourceIds.length
                        && !Game.getObjectById(mainSpawnerId).spawning) {
                        console.log("--- WARN: Spawn lock (by Limit) requested by " + creep.name
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
                    Memory.harvesters++;
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

            if (!_.isEmpty(Game.creeps)) {
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "harvester") {
                        currentHarvesters++;
                    }
                    if (Game.creeps[c].memory.role === "carry") {
                        currentCarry++;
                    }
                    if (Game.creeps[c].memory.role === "upgrader") {
                        currentUpgraders++;
                    }
                    if (Game.creeps[c].memory.role === "builder") {
                        currentBuilders++;
                    }
                    if (Game.creeps[c].memory.role === "repairer") {
                        currentRepairers++;
                    }
                    if (Game.creeps[c].memory.role === "scout") {
                        currentScouts++;
                    }
                    if (Game.creeps[c].memory.role === "warrior") {
                        currentWarriors++;
                    }
                }
                if (currentHarvesters !== Memory.harvesters) {
                    console.log("--- WARN: HARVESTER roles mismatch. Actual:" + currentHarvesters + "Memory:" + Memory.harvesters + " ---");
                    initRoles(true);
                } else if (currentCarry !== Memory.carry) {
                    console.log("--- WARN: CARRY roles mismatch. Actual:" + currentCarry + "Memory:" + Memory.carry + " ---");
                    initRoles(true);
                } else if (currentUpgraders !== Memory.upgraders) {
                    console.log("--- WARN: UPGRADER roles mismatch. Actual:" + currentUpgraders + "Memory:" + Memory.upgraders + " ---");
                    initRoles(true);
                } else if (currentBuilders !== Memory.builders) {
                    console.log("--- WARN: BUILDER roles mismatch. Actual:" + currentBuilders + "Memory:" + Memory.builders + " ---");
                    initRoles(true);
                } else if (currentRepairers !== Memory.repairers) {
                    console.log("--- WARN: REPAIRER roles mismatch. Actual:" + currentRepairers + "Memory:" + Memory.repairers + " ---");
                    initRoles(true);
                } else if (currentScouts !== Memory.scouts) {
                    console.log("--- WARN: SCOUT roles mismatch. Actual:" + currentScouts + "Memory:" + Memory.scouts + " ---");
                    initRoles(true);
                } else if (currentWarriors !== Memory.warriors) {
                    console.log("--- WARN: WARRIOR roles mismatch. Actual:" + currentWarriors + "Memory:" + Memory.warriors + " ---");
                    initRoles(true);
                }
            }
        }

        function initRoles(forceInit) {
            //Harvester
            if (!Memory.harvesters || forceInit) {
                if (!Memory.harvesters) {
                    console.log("--- WARN: Memory.harvesters was undefined! ---")
                }
                Memory.harvesters = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "harvester") {
                        Memory.harvesters++;
                    }
                }
            }

            //Upgrader
            if (!Memory.upgraders || forceInit) {
                if (!Memory.upgraders) {
                    console.log("--- WARN: Memory.upgraders was undefined! ---")
                }
                Memory.upgraders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "upgrader") {
                        Memory.upgraders++;
                    }
                }
            }

            //Builder
            if (!Memory.builders || forceInit) {
                if (!Memory.builders) {
                    console.log("--- WARN: Memory.builders was undefined! ---")
                }
                Memory.builders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "builder") {
                        Memory.builders++;
                    }
                }
            }

            //Repairer
            if (!Memory.repairers || forceInit) {
                if (!Memory.repairers) {
                    console.log("--- WARN: Memory.repairers was undefined! ---")
                }
                Memory.repairers = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "repairer") {
                        Memory.repairers++;
                    }
                }
            }

            //Carry
            if (!Memory.carry || forceInit) {
                if (!Memory.carry) {
                    console.log("--- WARN: Memory.carry was undefined! ---")
                }
                Memory.carry = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "carry") {
                        Memory.carry++;
                    }
                }
            }

            //Scout
            if (!Memory.scouts || forceInit) {
                if (!Memory.scouts) {
                    console.log("--- WARN: Memory.scouts was undefined! ---")
                }
                Memory.scouts = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "scout") {
                        Memory.scouts++;
                    }
                }
            }

            //Warrior
            if (!Memory.warriors || forceInit) {
                if (!Memory.warriors) {
                    console.log("--- WARN: Memory.warriors was undefined! ---")
                }
                Memory.warriors = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "warrior") {
                        Memory.warriors++;
                    }
                }
            }
            console.log("[T:" + Game.time
                + "] INFO: Initialization complete. Founded [H:"
                + Memory.harvesters + " U:" + Memory.upgraders + " C:" + Memory.carry +
                " B:" + Memory.builders + " R:" + Memory.repairers + " S:" + Memory.scouts + " W:" + Memory.warriors + "]")
        }
    }
};

module.exports = populationController;

//TODO: Разметка дороги по кратчайшему пути, кэширование дороги чтобы не дергать патфайндер.
// Асфальтирование кэшированной дороги.