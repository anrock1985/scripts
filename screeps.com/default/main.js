module.exports.loop = function () {
    let debug = true;

    let _ = require('lodash');
    let populationController = require('populationController');

    // If something happens with memory, initialize our roles.
    if (Game.time % 1000 === 0) {
        //Harvester
        if (Memory.harvesters === undefined) {
            console.log("ERROR: Memory.harvesters is undefined! Begin initializing...");
            Memory.harvesters = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "harvester") {
                    Memory.harvesters++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.harvesters + "] harvesters.")

            //Upgrader
        } else if (Memory.upgraders === undefined) {
            console.log("ERROR: Memory.upgraders is undefined! Begin initializing...");
            Memory.upgraders = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "upgrader") {
                    Memory.upgraders++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.upgraders + "] upgraders.")

            //Builder
        } else if (Memory.builders === undefined) {
            console.log("ERROR: Memory.builders is undefined! Begin initializing...");
            Memory.builders = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "builder") {
                    Memory.builders++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.builders + "] builders.")

            //Repairer
        } else if (Memory.repairers === undefined) {
            console.log("ERROR: Memory.repairers is undefined! Begin initializing...");
            Memory.repairers = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "repairer") {
                    Memory.repairers++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.repairers + "] repairers.")

            //Carry
        } else if (Memory.carry === undefined) {
            console.log("ERROR: Memory.carry is undefined! Begin initializing...");
            Memory.carry = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "carry") {
                    Memory.carry++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.carry + "] carries.")
        }
    }

    populationController.check();
};