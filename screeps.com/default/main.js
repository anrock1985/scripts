module.exports.loop = function () {
    let debug = true;

    let _ = require('lodash');

    let populationController = require('populationController');
    let towerController = require('towerController');

    let initPeriod = 100;
    let myTowersIds = [];

    if (_.isEmpty(Game.creeps)) {
        initRoles(true);
    } else {
        if (Game.time % initPeriod === 0) {
            initRoles(false);
        }
    }

    checkHarvesters();

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

    if (myTowersIds.length > 0) {
        towerController.attack();
    }

    for (let room in Game.rooms) {
        console.log("Iterating room:" + Game.rooms[room]);
        populationController.check(Game.rooms[room]);
    }
};