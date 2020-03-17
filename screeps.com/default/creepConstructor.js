let creepConstructor = {
    construct: function (spawner) {
        let debug = true;

        let _ = require('lodash');

        let logLevel = "debug";

        let totalAvailableEnergy = spawner.room.energyAvailable;

        let name = Game.time;

        function prepareBody(role) {
            let result = [];
            let count = 0;
            switch (role) {
                case "defaultHarvester":
                    for (count = 0; count < Math.trunc(totalAvailableEnergy / (BODYPART_COST.work + BODYPART_COST.carry + BODYPART_COST.move)); count++) {
                        result.push(MOVE);
                        result.push(CARRY);
                        result.push(WORK);
                    }
                    break;

                case "harvester":

                    result.push(MOVE);
                    totalAvailableEnergy -= (BODYPART_COST.move);

                    for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.work); count++) {
                        if (result.length === 50)
                            break;
                        if (count > 4)
                            break;
                        result.push(WORK);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.work * count);
                    if (totalAvailableEnergy >= 50) {
                        for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.move); count++) {
                            if (result.length === 50)
                                break;
                            if (count > 3)
                                break;
                            result.push(MOVE);
                        }
                    }
                    break;

                case "carry":
                    while (totalAvailableEnergy >= 100) {
                        if (result.length === 50)
                            break;
                        result.push(MOVE);
                        result.push(CARRY);
                        totalAvailableEnergy -= (BODYPART_COST.move + BODYPART_COST.carry);
                    }
                    break;

                case "upgrader":
                case "builder":
                case "repairer":
                    for (count = 0; count < Math.trunc(totalAvailableEnergy / (BODYPART_COST.work + BODYPART_COST.carry + BODYPART_COST.move)); count++) {
                        if (result.length === 50)
                            break;
                        result.push(WORK);
                        result.push(CARRY);
                        result.push(MOVE);
                    }
                    break;
                case "scout":
                    result.push(MOVE);
                    break;
                case "claimer":
                    //TODO: Claimer body.
                    break;
            }
            return result;
        }

        if (Memory.harvesters < 1) {
            console.log("WARN: No harvesters found in room " + spawner.room.name + "!");
            if (spawner.room.memory.droppedEnergyIds.length > 0 && Memory.carry < 2) {
                console.log("DEBUG: We have dropped energy");
                for (let e in spawner.room.memory.droppedEnergyIds) {
                    if (Game.getObjectById(spawner.room.memory.droppedEnergyIds[e]).amount >= 500) {
                        if (logLevel === "debug")
                            console.log("DEBUG: We have dropped energy of 500");
                        //Default Carry
                        if (spawner.isActive()
                            && !spawner.spawning
                            && spawner.room.energyAvailable >= 300 && Memory.carry < 2) {
                            name += "_C";
                            let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                            if (resultCode === 0) {
                                Memory.carry++;
                                let bodyParts = [];
                                _.forEach(Game.creeps[name].body, function (item) {
                                    bodyParts.push(item.type.toString().toUpperCase());
                                });
                                if (debug) {
                                    console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                                }
                            } else {
                                console.log("ERROR: Spawning CARRY result code: " + resultCode);
                            }
                        }
                        break;
                    }
                }
            } else {
                if (logLevel === "debug")
                    console.log("DEBUG: We don't have dropped energy");
                // Default Harvester
                if (spawner.isActive()
                    && !spawner.spawning
                    && spawner.room.energyAvailable >= 300) {
                    if (logLevel === "debug")
                        console.log("DEBUG: Constructing default harvester");
                    name += "_H";
                    let resultCode = spawner.spawnCreep(prepareBody("defaultHarvester"), name, {memory: {role: "harvester"}});
                    if (resultCode === 0) {
                        Memory.harvesters++;
                        let bodyParts = [];
                        _.forEach(Game.creeps[name].body, function (item) {
                            bodyParts.push(item.type.toString().toUpperCase());
                        });
                        if (debug) {
                            console.log("INFO: new HARVESTER [total:" + Memory.harvesters + "] (" + bodyParts + ")");
                        }
                    } else {
                        console.log("ERROR: Spawning HARVESTER result code: " + resultCode);
                    }
                }
            }
        } else {
            //Carry
            if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 100
                && Memory.carry < 1) {
                name += "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                if (resultCode === 0) {
                    Memory.carry++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning CARRY result code: " + resultCode);
                }
            }

            // Harvester
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && Memory.harvesters < 2) {
                name += "_H";
                let resultCode = spawner.spawnCreep(prepareBody("harvester"), name, {memory: {role: "harvester"}});
                if (resultCode === 0) {
                    Memory.harvesters++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new HARVESTER [total:" + Memory.harvesters + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning HARVESTER result code: " + resultCode);
                }
            }

            //Carry
            else if (spawner.room.memory.availableDroppedEnergyInRoom > 100
                && spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && Memory.carry < 8) {
                name += "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                if (resultCode === 0) {
                    Memory.carry++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new CARRY [total:" + Memory.carry + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning CARRY result code: " + resultCode);
                }
            }

            //Builder
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.memory.myConstructionSiteIds.length > 0
                && spawner.room.energyAvailable >= 300
                && Memory.builders < ((spawner.room.memory.myConstructionSiteIds.length > 2) ? 2 : 1)) {
                name += "_B";
                let resultCode = spawner.spawnCreep(prepareBody("builder"), name, {memory: {role: "builder"}});
                if (resultCode === 0) {
                    Memory.builders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new BUILDER [total:" + Memory.builders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning BUILDER result code: " + resultCode);
                }
            }

            //Repairer
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && Memory.repairers < 2) {
                name += "_R";
                let resultCode = spawner.spawnCreep(prepareBody("repairer"), name, {memory: {role: "repairer"}});
                if (resultCode === 0) {
                    Memory.repairers++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new REPAIRER [total:" + Memory.repairers + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning REPAIRER result code: " + resultCode);
                }
            }

            //Upgrader
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && Memory.upgraders < ((spawner.room.memory.myConstructionSiteIds.length === 0) ? 4 : 2)) {
                name += "_U";
                let resultCode = spawner.spawnCreep(prepareBody("upgrader"), name, {memory: {role: "upgrader"}});
                if (resultCode === 0) {
                    Memory.upgraders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: new UPGRADER [total:" + Memory.upgraders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: Spawning UPGRADER result code: " + resultCode);
                }
            }

            // //Scout
            // else if (spawner.isActive()
            //     && !spawner.spawning
            //     && spawner.room.energyAvailable >= 300
            //     && Memory.scouts < 1) {
            //     let name = Game.time + "_S";
            //     let resultCode = spawner.spawnCreep(prepareBody("scout"), name, {memory: {role: "scout"}});
            //     if (resultCode === 0) {
            //         Memory.scouts++;
            //         let bodyParts = [];
            //         _.forEach(Game.creeps[name].body, function (item) {
            //             bodyParts.push(item.type.toString().toUpperCase());
            //         });
            //         if (debug) {
            //             console.log("INFO: new SCOUT [total:" + Memory.scouts + "] (" + bodyParts + ")");
            //         }
            //     } else {
            //         console.log("ERROR: Spawning SCOUT result code: " + resultCode);
            //     }
            // }
        }
    }
};

module.exports = creepConstructor;

//TODO: Если достигнут предел по крипам, а крипы слабее чем позволяет конструктор, надо их обновить.

//TODO: Спавнить carry в зависимости от лежащих ресурсов.