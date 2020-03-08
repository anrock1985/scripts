module.exports.loop = function () {
    let debug = true;

    let _ = require('lodash');
    let populationController = require('populationController');

    // If something happens with memory, initialize our roles.
    if (Memory.harvesters === undefined) {
        console.log("ERROR: Memory.harvesters is undefined! Begin initializing...");
        Memory.harvesters = 0;
        for (let c in Game.creeps) {
            if (Game.creeps[c].role === "harvester") {
                Memory.harvesters++;
            }
        }
        console.log("INFO: Initialization complete. Founded [" + Memory.harvesters + "] harvesters.")

    } else if (Memory.upgraders === undefined) {
        console.log("ERROR: Memory.upgraders is undefined! Begin initializing...");
        Memory.upgraders = 0;
        for (let c in Game.creeps) {
            if (Game.creeps[c].role === "upgrader") {
                Memory.upgraders++;
            }
        }
        console.log("INFO: Initialization complete. Founded [" + Memory.upgraders + "] upgraders.")

    } else if (Memory.builders === undefined) {
        console.log("ERROR: Memory.builders is undefined! Begin initializing...");
        Memory.builders = 0;
        for (let c in Game.creeps) {
            if (Game.creeps[c].role === "builder") {
                Memory.builders++;
            }
        }
        console.log("INFO: Initialization complete. Founded [" + Memory.builders + "] builders.")

    } else if (Memory.carry === undefined) {
        console.log("ERROR: Memory.carry is undefined! Begin initializing...");
        Memory.carry = 0;
        for (let c in Game.creeps) {
            if (Game.creeps[c].role === "carry") {
                Memory.carry++;
            }
        }
        console.log("INFO: Initialization complete. Founded [" + Memory.builders + "] builders.")
    }

    populationController.check();
};