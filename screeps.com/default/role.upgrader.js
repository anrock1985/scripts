let roleUpgrader = {
    run: function (creep) {
        let _ = require('lodash');

        if (creep.memory.upgrading === undefined) {
            creep.memory.upgrading = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.upgrading) {
            creep.memory.upgrading = false;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.upgrading) {
            creep.memory.upgrading = true;
        }

        let closestSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (closestSpawner) {
            creep.memory.closestSpawnerId = closestSpawner.id;
        }

        let storages = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
            }
        });

        let storagesWithEnoughEnergy = creep.pos.findClosestByPath(storages, {
            filter: (s) => {
                return s.store[RESOURCE_ENERGY] >= creep.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        if (storagesWithEnoughEnergy === null) {
            creep.memory.closestStorageId = undefined;
        } else {
            creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        }

        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.upgrading) {
            if (creep.memory.closestStorageId) {
                if (Game.getObjectById(creep.memory.closestStorageId).store[RESOURCE_ENERGY] >= 250 && Memory.harvesters > 1) {
                    if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                    }
                }
            }
        }

        if (creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.upgrading) {
            if (creep.upgradeController(Game.getObjectById(creep.room.controller.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.room.controller.id));
            }
        }
    }
};

module.exports = roleUpgrader;