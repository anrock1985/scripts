module.exports.loop = function () {
    let debug = true;

    let _ = require('lodash');

    let populationController = require('populationController');
    let towerController = require('towerController');

    let initPeriod = 1000;

    let myTowersIds = [];
    // let myTowersIds = Game.structures.find(FIND_MY_STRUCTURES, {
    //     filter: (s) => {
    //         return (s.structureType === STRUCTURE_TOWER).id
    //     }
    // });

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
        if (!_.isEmpty(Game.creeps)) {
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "harvester") {
                    currentHarvesters++;
                }
            }
            if (currentHarvesters !== Memory.harvesters) {
                initRoles(true);
            }
        }
    }

    function initRoles(forceInit) {
        //Harvester
        if (Memory.harvesters === undefined || forceInit) {
            console.log("[tick:" + Game.time + "] ERROR: Memory.harvesters is undefined! Begin initializing...");
            Memory.harvesters = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "harvester") {
                    Memory.harvesters++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.harvesters + "] harvesters.")
        }

        //Upgrader
        if (Memory.upgraders === undefined || forceInit) {
            console.log("[tick:" + Game.time + "] ERROR: Memory.upgraders is undefined! Begin initializing...");
            Memory.upgraders = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "upgrader") {
                    Memory.upgraders++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.upgraders + "] upgraders.")
        }

        //Builder
        if (Memory.builders === undefined || forceInit) {
            console.log("[tick:" + Game.time + "] ERROR: Memory.builders is undefined! Begin initializing...");
            Memory.builders = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "builder") {
                    Memory.builders++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.builders + "] builders.")
        }

        //Repairer
        if (Memory.repairers === undefined || forceInit) {
            console.log("[tick:" + Game.time + "] ERROR: Memory.repairers is undefined! Begin initializing...");
            Memory.repairers = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "repairer") {
                    Memory.repairers++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.repairers + "] repairers.")
        }

        //Carry
        if (Memory.carry === undefined || forceInit) {
            console.log("[tick:" + Game.time + "] ERROR: Memory.carry is undefined! Begin initializing...");
            Memory.carry = 0;
            for (let c in Game.creeps) {
                if (Game.creeps[c].memory.role === "carry") {
                    Memory.carry++;
                }
            }
            console.log("INFO: Initialization complete. Founded [" + Memory.carry + "] carries.")
        }
    }

    if (myTowersIds.length > 0) {
        towerController.attack();
    }

    for (let room in Game.rooms) {
        populationController.check(Game.rooms[room]);
    }
};