let populationController = {

    check: function (room) {

        let debug = true;

        let _ = require('lodash');

        let roleHarvester = require('role.harvester');
        let roleUpgrader = require('role.upgrader');
        let roleBuilder = require('role.builder');
        let roleCarry = require('role.carry');
        let roleRepairer = require('role.repairer');
        let roleDeadman = require('role.deadman');
        let creepConstructor = require('creepConstructor');

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
                switch (Memory.creeps[c].lastRole) {
                    case "harvester":
                        Memory.harvesters--;
                        break;
                    case "upgrader":
                        Memory.upgraders--;
                        break;
                    case "builder":
                        Memory.builders--;
                        break;
                    case "carry":
                        Memory.carry--;
                        break;
                    case "repairer":
                        Memory.repairers--;
                        break;
                }
                delete Memory.creeps[c];
            }
        }

        for (let c in Game.creeps) {
            let creep = Game.creeps[c];

            if (creep.ticksToLive === 3) {
                roleDeadman.assign(creep);
            }

            if (creep.memory.role === "harvester") {
                roleHarvester.run(creep);
            } else if (creep.memory.role === "upgrader") {
                roleUpgrader.run(creep);
            } else if (creep.memory.role === "carry") {
                roleCarry.run(creep);
            } else if (creep.memory.role === "builder") {
                roleBuilder.run(creep);
            } else if (creep.memory.role === "repairer") {
                roleRepairer.assign(creep);
            } else if (creep.memory.role === "deadman") {
                roleDeadman.assign(creep);
            } else if (!creep.memory.role
                && _.filter(creep.body, (body) => body.type = WORK)
                && _.filter(creep.body, (body) => body.type = CARRY)
                && _.filter(creep.body, (body) => body.type = MOVE)) {
                creep.memory.role = "harvester";
                Memory.harvesters++;
                if (debug) {
                    console.log("WARN: Lost creep recovered. He is " + creep.memory.role.toUpperCase() + " now. (" + creep.body.toString() + ")")
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
                console.log("[T:" + Game.time + "] INFO: Initialization complete. Founded [" + Memory.harvesters + "] harvesters.")
            }

            //Upgrader
            if (Memory.upgraders === undefined || forceInit) {
                Memory.upgraders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "upgrader") {
                        Memory.upgraders++;
                    }
                }
                console.log("[T:" + Game.time + "] INFO: Initialization complete. Founded [" + Memory.upgraders + "] upgraders.")
            }

            //Builder
            if (Memory.builders === undefined || forceInit) {
                Memory.builders = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "builder") {
                        Memory.builders++;
                    }
                }
                console.log("[T:" + Game.time + "] INFO: Initialization complete. Founded [" + Memory.builders + "] builders.")
            }

            //Repairer
            if (Memory.repairers === undefined || forceInit) {
                Memory.repairers = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "repairer") {
                        Memory.repairers++;
                    }
                }
                console.log("[T:" + Game.time + "] INFO: Initialization complete. Founded [" + Memory.repairers + "] repairers.")
            }

            //Carry
            if (Memory.carry === undefined || forceInit) {
                Memory.carry = 0;
                for (let c in Game.creeps) {
                    if (Game.creeps[c].memory.role === "carry") {
                        Memory.carry++;
                    }
                }
                console.log("[T:" + Game.time + "] INFO: Initialization complete. Founded [" + Memory.carry + "] carries.")
            }
        }
    }
};

module.exports = populationController;


//TODO: Резервирование ресурса, чтобы толпа не ходила за одной крошкой.
// Резервируем в стаке столько энергии сколько можем унести.
// При смерти сбрасываем резерв.
// Ведем реестр зарезервированного.

//TODO: Разметка дороги по кратчайшему пути, кэширование дороги чтобы не дергать патфайндер.
// Асфальтирование кэшированной дороги.