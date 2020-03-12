let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.carrying) {
            creep.memory.carrying = true;
            creep.memory.closestDroppedEnergyId = undefined;
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

        let closestStorageNotFull = {};
        let spawnerNotFull = {};
        let extensionNotFull = {};
        let towerNotHalfFull = {};

        if (storagesNotFull) {
            closestStorageNotFull = creep.pos.findClosestByPath(storagesNotFull);

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

        if (creep.memory.carrying) {
            if (towerNotHalfFull) {
                creep.memory.closestStorageId = creep.pos.findClosestByPath(towerNotHalfFull).id;
                console.log("DEBUG: Storing to tower")
            } else if (extensionNotFull) {
                creep.memory.closestStorageId = creep.pos.findClosestByPath(extensionNotFull).id;
                console.log("DEBUG: Storing to extension")
            } else if (spawnerNotFull) {
                creep.memory.closestStorageId = creep.pos.findClosestByPath(spawnerNotFull).id;
                console.log("DEBUG: Storing to spawner")
            } else if (closestStorageNotFull) {
                creep.memory.closestStorageId = creep.pos.findClosestByPath(closestStorageNotFull).id;
                console.log("DEBUG: Storing to random")
            }
        }

        if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== 0
        ) {
            if (creep.memory.closestStorageId) {
                if (creep.transfer(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                }
            }
        }

        if (!creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.memory.closestDroppedEnergyId) {
                if (creep.pickup(Game.getObjectById(creep.memory.closestDroppedEnergyId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestDroppedEnergyId))
                }
            }
        }
    }
};

module.exports = roleCarry;

//TODO: Если от ресурса до склада - дорога, строим только грузовики.

//TODO: Подбор соринок энергии оставшихся от трупов, если они не далеко от основного пути.

//TODO: Если загружены хоть чем-то, не ходить на дальний спот для полной загрузки.