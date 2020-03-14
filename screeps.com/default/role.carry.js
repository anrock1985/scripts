let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        let resourcePoolController = require('resourcePoolController');

        let logLevel = "info";

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.carrying) {
            creep.memory.carrying = true;
            creep.memory.closestDroppedEnergyId = undefined;
            if (creep.memory.reservedResource) {
                resourcePoolController.release(creep);
            }
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.carrying) {
            creep.memory.carrying = false
        }

        let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType === RESOURCE_ENERGY
            }
        });

        let biggestDroppedEnergy = droppedEnergy.sort(function (a, b) {
            return b.amount - a.amount
        })[0];

        if (!creep.memory.carrying && !creep.memory.closestDroppedEnergyId || !Game.getObjectById(creep.memory.closestDroppedEnergyId)) {
            if (!droppedEnergy) {
                creep.memory.closestDroppedEnergyId = undefined;
            } else {
                if (biggestDroppedEnergy) {
                    creep.memory.closestDroppedEnergyId = biggestDroppedEnergy.id;
                } else {
                    creep.memory.closestDroppedEnergyId = undefined;
                }
            }
        }

        let storagesNotFull = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_TOWER)
                    && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        let spawnerNotFull = {};
        let extensionNotFull = {};
        let towerNotHalfFull = {};

        if (storagesNotFull) {
            spawnerNotFull = storagesNotFull.filter(function (a) {
                return a.structureType === STRUCTURE_SPAWN;
            });

            extensionNotFull = storagesNotFull.filter(function (a) {
                return a.structureType === STRUCTURE_EXTENSION;
            });

            towerNotHalfFull = storagesNotFull.filter(function (a) {
                return a.structureType === STRUCTURE_TOWER
                    && a.store[RESOURCE_ENERGY] < (a.store.getCapacity(RESOURCE_ENERGY) / 2);
            });
        }

        creep.memory.closestStorageId = {};
        if (creep.memory.carrying) {
            if (towerNotHalfFull.length > 0) {
                let closestTowerNotHalfFull = creep.pos.findClosestByPath(towerNotHalfFull);
                if (closestTowerNotHalfFull !== null) {
                    creep.memory.closestStorageId = closestTowerNotHalfFull.id;
                }
                if (logLevel === "debug")
                    console.log("DEBUG: Storing to tower");
            } else if (extensionNotFull.length > 0) {
                let closestExtensionNotFull = creep.pos.findClosestByPath(extensionNotFull);
                if (closestExtensionNotFull !== null) {
                    creep.memory.closestStorageId = closestExtensionNotFull.id;
                }
                if (logLevel === "debug")
                    console.log("DEBUG: Storing to extension");
            } else if (spawnerNotFull.length > 0) {
                let closestSpawnerNotFull = creep.pos.findClosestByPath(spawnerNotFull);
                if (closestSpawnerNotFull !== null) {
                    creep.memory.closestStorageId = closestSpawnerNotFull.id;
                }
                if (logLevel === "debug")
                    console.log("DEBUG: Storing to spawner");
            } else if (storagesNotFull.length > 0) {
                let closestStoragesNotFull = creep.pos.findClosestByPath(storagesNotFull);
                if (closestStoragesNotFull !== null) {
                    creep.memory.closestStorageId = closestStoragesNotFull.id;
                }
                if (logLevel === "debug")
                    console.log("DEBUG: Storing to random");
            } else {
                if (logLevel === "info")
                    console.log("WARN: Carry can't find storage!");
            }
        }

        if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== 0) {
            if (creep.memory.closestStorageId) {
                if (creep.transfer(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                }
            }
        }

        if (!creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.memory.reservedResource) {
                let filteredDrops = droppedEnergy.filter(function (a) {
                    return a.id === creep.memory.reservedResource.id;
                });
                if (filteredDrops.length === 0) {
                    console.log("WARN: Reserved resource disappear");
                    creep.memory.reservedResource = {};
                }
            }

            // if (creep.room.memory.resourcePool[creep.memory.closestDroppedEnergyId].amount >= creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (!creep.memory.reservedResource || !creep.memory.reservedResource.id) {
                for (let r in droppedEnergy) {
                    if (droppedEnergy[r].amount >= (creep.store.getCapacity(RESOURCE_ENERGY) - creep.store[RESOURCE_ENERGY])) {
                        resourcePoolController.reserve(creep, droppedEnergy[r].id,
                            droppedEnergy[r].resourceType,
                            (creep.store.getCapacity(RESOURCE_ENERGY) - creep.store[RESOURCE_ENERGY]));
                    }
                }
            }
            
            if (creep.memory.reservedResource) {
                if (creep.pickup(Game.getObjectById(creep.memory.reservedResource.id)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.reservedResource.id))
                }
            }
            // }
        }
    }
};

module.exports = roleCarry;

//TODO: Если от ресурса до склада - дорога, строим только грузовики.

//TODO: Подбор соринок энергии оставшихся от трупов, если они не далеко от основного пути.

//TODO: Если загружены хоть чем-то, не ходить на дальний спот для полной загрузки.

//TODO: Аудит зависимостей.