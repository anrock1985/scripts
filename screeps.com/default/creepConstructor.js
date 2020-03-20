let creepConstructor = {
    construct: function (spawner) {
        let debug = true;

        let _ = require('lodash');

        let spawnHelper = require('spawnHelper');

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
                        if (count > 4)
                            break;
                        result.push(WORK);
                    }
                    totalAvailableEnergy -= (BODYPART_COST.work * count);
                    if (totalAvailableEnergy >= 50) {
                        for (count = 0; count < Math.trunc(totalAvailableEnergy / BODYPART_COST.move); count++) {
                            if (count > 3)
                                break;
                            result.push(MOVE);
                        }
                    }
                    break;

                case "carry":
                    while (totalAvailableEnergy >= 100) {
                        if (result.length === 12)
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
                        if (result.length === 18)
                            break;
                        result.push(WORK);
                        result.push(CARRY);
                        result.push(MOVE);
                    }
                    break;
                case "scout":
                    result.push(MOVE);
                    break;
                case "warrior":
                    for (count = 0; count < Math.trunc(totalAvailableEnergy / (BODYPART_COST.move + BODYPART_COST.attack + (BODYPART_COST.tough * 2))); count++) {
                        if (result.length === 50)
                            break;
                        result.push(TOUGH);
                        result.push(TOUGH);
                        result.push(MOVE);
                        result.push(ATTACK);
                    }
                    break;
                case "claimer":
                    //TODO: Claimer body.
                    break;
            }
            return result;
        }

        if (spawner.room.memory.harvesters < 1) {
            console.log("WARN: No harvesters found in room " + spawner.room.name + "!");
            if (spawner.room.memory.droppedEnergyIds.length > 0 && spawner.room.memory.carrys < 2) {
                console.log("DEBUG: We have dropped energy in room " + spawner.room.name);
                    if (spawner.room.memory.totalAvailableResourcePool >= 500) {
                        if (logLevel === "debug")
                            console.log("DEBUG: We have dropped energy of 500 in room " + spawner.room.name);
                        //Default Carry
                        if (spawner.isActive()
                            && !spawner.spawning
                            && spawner.room.energyAvailable >= 300 && spawner.room.memory.carrys < 2) {
                            name += "_C";
                            let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                            if (resultCode === 0) {
                                spawner.room.memory.carrys++;
                                let bodyParts = [];
                                _.forEach(Game.creeps[name].body, function (item) {
                                    bodyParts.push(item.type.toString().toUpperCase());
                                });
                                if (debug) {
                                    console.log("INFO: " + spawner.room.name + " new CARRY [total:" + spawner.room.memory.carrys + "] (" + bodyParts + ")");
                                }
                            } else {
                                console.log("ERROR: " + spawner.room.name + " Spawning CARRY result code: " + resultCode);
                            }
                        }
                    }
            } else {
                if (logLevel === "debug")
                    console.log("DEBUG: We don't have dropped energy in room " + spawner.room.name);
                // Default Harvester
                if (spawner.isActive()
                    && !spawner.spawning
                    && spawner.room.energyAvailable >= 300) {
                    if (logLevel === "debug")
                        console.log("DEBUG: Constructing default harvester in room " + spawner.room.name);
                    name += "_H";
                    let resultCode = spawner.spawnCreep(prepareBody("defaultHarvester"), name, {memory: {role: "harvester"}});
                    if (resultCode === 0) {
                        spawner.room.memory.harvesters++;
                        let bodyParts = [];
                        _.forEach(Game.creeps[name].body, function (item) {
                            bodyParts.push(item.type.toString().toUpperCase());
                        });
                        if (debug) {
                            console.log("INFO: " + spawner.room.name + " new HARVESTER [total:" + spawner.room.memory.harvesters + "] (" + bodyParts + ")");
                        }
                    } else {
                        console.log("ERROR: " + spawner.room.name + " Spawning HARVESTER result code: " + resultCode);
                    }
                }
            }
        } else if (spawnHelper.isSpawnLocked(spawner.room)) {
            if ((spawner.room.energyAvailable >= 750 || spawner.room.energyAvailable === spawner.room.energyCapacityAvailable)
                && spawner.isActive() && !spawner.spawning) {
                name += "_H";
                let resultCode = spawner.spawnCreep(prepareBody("harvester"), name, {memory: {role: "harvester"}});
                if (resultCode === 0) {
                    spawner.room.memory.harvesters++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new HARVESTER [total:" + spawner.room.memory.harvesters + "] (" + bodyParts + ")");
                    }
                    spawnHelper.unlockSpawn(spawner.room);
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning HARVESTER result code: " + resultCode);
                }
            }
        } else {
            // Harvester
            if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && spawner.room.memory.harvesters < spawner.room.memory.sourceIds.length) {
                name += "_H";
                let resultCode = spawner.spawnCreep(prepareBody("harvester"), name, {memory: {role: "harvester"}});
                if (resultCode === 0) {
                    spawner.room.memory.harvesters++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new HARVESTER [total:" + spawner.room.memory.harvesters + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning HARVESTER result code: " + resultCode);
                }
            }

            //Carry
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 100
                && spawner.room.memory.carrys < 1) {
                name += "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                if (resultCode === 0) {
                    spawner.room.memory.carrys++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new CARRY [total:" + spawner.room.memory.carrys + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning CARRY result code: " + resultCode);
                }
            }

            //Carry
            else if (spawner.room.memory.availableDroppedEnergyInRoom >= 300
                && spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 600
                && spawner.room.memory.carrys < 8) {
                name += "_C";
                let resultCode = spawner.spawnCreep(prepareBody("carry"), name, {memory: {role: "carry"}});
                if (resultCode === 0) {
                    spawner.room.memory.carrys++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new CARRY [total:" + spawner.room.memory.carrys + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning CARRY result code: " + resultCode);
                }
            }

            //Builder
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.memory.myConstructionSiteIds.length > 0
                && spawner.room.energyAvailable >= 300
                && spawner.room.memory.builders < ((spawner.room.memory.myConstructionSiteIds.length > 2) ? 2 : 1)) {
                name += "_B";
                let resultCode = spawner.spawnCreep(prepareBody("builder"), name, {memory: {role: "builder"}});
                if (resultCode === 0) {
                    spawner.room.memory.builders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new BUILDER [total:" + spawner.room.memory.builders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning BUILDER result code: " + resultCode);
                }
            }

            //Repairer
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && spawner.room.memory.repairers < 2) {
                name += "_R";
                let resultCode = spawner.spawnCreep(prepareBody("repairer"), name, {memory: {role: "repairer"}});
                if (resultCode === 0) {
                    spawner.room.memory.repairers++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new REPAIRER [total:" + spawner.room.memory.repairers + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning REPAIRER result code: " + resultCode);
                }
            }

            //Upgrader
            else if (spawner.isActive()
                && !spawner.spawning
                && spawner.room.energyAvailable >= 300
                && spawner.room.memory.upgraders < ((spawner.room.memory.myConstructionSiteIds.length === 0) ? 4 : 2)) {
                name += "_U";
                let resultCode = spawner.spawnCreep(prepareBody("upgrader"), name, {memory: {role: "upgrader"}});
                if (resultCode === 0) {
                    spawner.room.memory.upgraders++;
                    let bodyParts = [];
                    _.forEach(Game.creeps[name].body, function (item) {
                        bodyParts.push(item.type.toString().toUpperCase());
                    });
                    if (debug) {
                        console.log("INFO: " + spawner.room.name + " new UPGRADER [total:" + spawner.room.memory.upgraders + "] (" + bodyParts + ")");
                    }
                } else {
                    console.log("ERROR: " + spawner.room.name + " Spawning UPGRADER result code: " + resultCode);
                }
            }

            // //Scout
            // else if (spawner.isActive()
            //     && !spawner.spawning
            //     && spawner.room.energyAvailable >= 300
            //     && spawner.room.memory.scouts < 1) {
            //     let name = Game.time + "_S";
            //     let resultCode = spawner.spawnCreep(prepareBody("scout"), name, {memory: {role: "scout"}});
            //     if (resultCode === 0) {
            //         spawner.room.memory.scouts++;
            //         let bodyParts = [];
            //         _.forEach(Game.creeps[name].body, function (item) {
            //             bodyParts.push(item.type.toString().toUpperCase());
            //         });
            //         if (debug) {
            //             console.log("INFO: " + spawner.room.name + " new SCOUT [total:" + spawner.room.memory.scouts + "] (" + bodyParts + ")");
            //         }
            //     } else {
            //         console.log("ERROR: " + spawner.room.name + " Spawning SCOUT result code: " + resultCode);
            //     }
            // }

            // //Warrior
            // else if (spawner.isActive()
            //     && !spawner.spawning
            //     && spawner.room.energyAvailable >= 300
            //     && spawner.room.memory.warriors < 1) {
            //     name += "_W";
            //     let resultCode = spawner.spawnCreep(prepareBody("warrior"), name, {memory: {role: "warrior"}});
            //     if (resultCode === 0) {
            //         spawner.room.memory.warriors++;
            //         let bodyParts = [];
            //         _.forEach(Game.creeps[name].body, function (item) {
            //             bodyParts.push(item.type.toString().toUpperCase());
            //         });
            //         if (debug) {
            //             console.log("INFO: " + spawner.room.name + " new WARRIOR [total:" + spawner.room.memory.warriors + "] (" + bodyParts + ")");
            //         }
            //     } else {
            //         console.log("ERROR: " + spawner.room.name + " Spawning WARRIOR result code: " + resultCode);
            //     }
            // }

            // //Claimer
            // else if (spawner.isActive()
            //     && !spawner.spawning
            //     && spawner.room.energyAvailable >= 300
            //     && spawner.room.memory.claimers < 1) {
            //     name += "_W";
            //     let resultCode = spawner.spawnCreep(prepareBody("claimer"), name, {memory: {role: "claimer"}});
            //     if (resultCode === 0) {
            //         spawner.room.memory.claimers++;
            //         let bodyParts = [];
            //         _.forEach(Game.creeps[name].body, function (item) {
            //             bodyParts.push(item.type.toString().toUpperCase());
            //         });
            //         if (debug) {
            //             console.log("INFO: " + spawner.room.name + " new CLAIMER [total:" + spawner.room.memory.claimers + "] (" + bodyParts + ")");
            //         }
            //     } else {
            //         console.log("ERROR: " + spawner.room.name + " Spawning CLAIMER result code: " + resultCode);
            //     }
            // }
        }
    }
};

module.exports = creepConstructor;

//TODO: Если достигнут предел по крипам, а крипы слабее чем позволяет конструктор, надо их обновить.

//TODO: Спавнить carry в зависимости от лежащих ресурсов.
