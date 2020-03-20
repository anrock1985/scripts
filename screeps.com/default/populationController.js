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
            initRoles(true);
        } else {
            if (Game.time % initPeriod === 0) {
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

                // switch (Memory.creeps[c].lastRole) {
                //     case "harvester":
                //         Memory.harvesters--;
                //         break;
                //     case "upgrader":
                //         Memory.upgraders--;
                //         break;
                //     case "builder":
                //         Memory.builders--;
                //         break;
                //     case "carry":
                //         Memory.carry--;
                //         break;
                //     case "repairer":
                //         Memory.repairers--;
                //         break;
                //     case "scout":
                //         Memory.scouts--;
                //         break;
                //     case "warrior":
                //         Memory.warriors--;
                //         break;
                // }
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
                        spawnHelper.lockSpawn(creep.room);
                    }
                    if (!spawnHelper.isSpawnLocked(creep.room)
                        && Memory.harvesters > 0
                        && Memory.harvesters < creep.room.memory.sourceIds.length
                        && !Game.getObjectById(mainSpawnerId).spawning) {
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
                    initRoles(true);
                } else if (currentCarry !== Memory.carry) {
                    initRoles(true);
                } else if (currentUpgraders !== Memory.upgraders) {
                    initRoles(true);
                } else if (currentBuilders !== Memory.builders) {
                    initRoles(true);
                } else if (currentRepairers !== Memory.repairers) {
                    initRoles(true);
                } else if (currentScouts !== Memory.scouts) {
                    initRoles(true);
                } else if (currentWarriors !== Memory.warriors) {
                    initRoles(true);
                }
            }
        }

        function initRoles(forceInit) {
            //Harvester
            if (Memory.harvesters === undefined || forceInit) {
                Memory.harvesters = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "harvester") {
                        Memory.harvesters++;
                    }
                }
            }

            //Upgrader
            if (Memory.upgraders === undefined || forceInit) {
                Memory.upgraders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "upgrader") {
                        Memory.upgraders++;
                    }
                }
            }

            //Builder
            if (Memory.builders === undefined || forceInit) {
                Memory.builders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "builder") {
                        Memory.builders++;
                    }
                }
            }

            //Repairer
            if (Memory.repairers === undefined || forceInit) {
                Memory.repairers = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "repairer") {
                        Memory.repairers++;
                    }
                }
            }

            //Carry
            if (Memory.carry === undefined || forceInit) {
                Memory.carry = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "carry") {
                        Memory.carry++;
                    }
                }
            }

            //Scout
            if (Memory.scouts === undefined || forceInit) {
                Memory.scouts = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "scout") {
                        Memory.scouts++;
                    }
                }
            }

            //Warrior
            if (Memory.warriors === undefined || forceInit) {
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