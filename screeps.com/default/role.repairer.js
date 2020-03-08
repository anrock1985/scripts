let roleRepairer = {
    assign: function (creep) {
        let _ = require('lodash');

        let debug = true;

        let closestDamagedStructure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.hits < (s.hitsMax / 3)
            }
        });

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
            }
        });

        let storagesWithEnoughEnergy = creep.pos.findClosestByRange(storages, {
            filter: (s) => {
                return s.store[RESOURCE_ENERGY] >= creep.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        if (storagesWithEnoughEnergy === null) {
            creep.memory.closestStorageId = undefined;
        } else {
            creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        }

        if (closestDamagedStructure === null) {
            creep.memory.closestDamagedStructureId = undefined;
        } else {
            creep.memory.closestDamagedStructureId = closestDamagedStructure.id;
        }

        if (creep.memory.repairing === undefined) {
            creep.memory.repairing = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.repairing) {
            creep.memory.repairing = false;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.repairing = true;
        }

        if (creep.memory.closestDamagedStructureId) {
            if (creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.repairing) {
                if (creep.repair(Game.getObjectById(creep.memory.closestDamagedStructureId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestDamagedStructureId))
                }
            }
        }

        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.repairing) {
            if (creep.memory.closestStorageId) {
                if (storagesWithEnoughEnergy.structureType === STRUCTURE_CONTAINER) {
                    if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                    }
                } else if (creep.room.energyAvailable >= 300 && Memory.harvesters > 1) {
                    if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                    }
                }
            }
        }
    }
};

module.exports = roleRepairer;