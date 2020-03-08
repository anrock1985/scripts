let populationController = {

    check: function (room) {

        let debug = true;

        let _ = require('lodash');

        let roleHarvester = require('role.harvester');
        let roleUpgrader = require('role.upgrader');
        let roleBuilder = require('role.builder');
        let roleCarry = require('role.carry');
        let roleDeadman = require('role.deadman');
        let creepConstructor = require('creepConstructor');

        let mainSpawnerId = Game.spawns["Spawn1"].id;

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
                    Memory.deadWithCarryPercent = Memory.deadTotal === 0
                        ? 0 : Math.trunc(((Memory.deadWithCarry / Memory.deadTotal) * 100));
                }
                if (debug) {
                    console.log("INFO: RIP " + Memory.creeps[c].name + ". "
                        + Memory.deadWithCarryPercent + "% of " + Memory.deadTotal
                        + " died creeps has energy carried. Energy losses are "
                        + Memory.lostEnergy + ". Top loss are: " + Memory.topEnergyLoss
                        + ". Latest are: " + ((Memory.creeps[c].carriedEnergy === undefined) ? 0 : Memory.creeps[c].carriedEnergy));
                }
                switch (Memory.creeps[c].role) {
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
                }
                delete Memory.creeps[c];
            }
        }

        for (let c in Game.creeps) {
            let creep = Game.creeps[c];
            if (creep.ticksToLive === 3) {
                roleDeadman.assign(creep)
            }
            if (creep.memory.role === "harvester") {
                roleHarvester.run(creep);
            } else if (creep.memory.role === "upgrader") {
                roleUpgrader.run(creep);
            } else if (creep.memory.role === "carry") {
                roleCarry.run(creep);
            } else if (creep.memory.role === "builder") {
                roleBuilder.run(creep);
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
    }
};

module.exports = populationController;