let roleRepairer = {
    assign: function (creep) {
        let _ = require('lodash');

        let debug = true;

        let storagePoolController = require('storagePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        let damagedStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return ((s.structureType !== STRUCTURE_CONTROLLER) && (s.hits <= (s.hitsMax - (s.hitsMax / 6))));
            }
        });

        if (damagedStructures === null) {
            creep.memory.closestDamagedStructureId = undefined;
        } else {
            let closestDamagedStructure = creep.pos.findClosestByRange(damagedStructures);
            if (closestDamagedStructure === null) {
                creep.memory.closestDamagedStructureId = undefined;
            } else {
                creep.memory.closestDamagedStructureId = closestDamagedStructure.id;
            }
        }

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_STORAGE)
                    && s.store[RESOURCE_ENERGY] >= (creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        });

        let storagesWithEnoughEnergy = {};
        if (storages) {
            storagesWithEnoughEnergy = creep.pos.findClosestByRange(storages);
        }

        if (!storagesWithEnoughEnergy) {
            creep.memory.closestStorageId = undefined;
        } else {
            creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        }

        if (creep.memory.repairing === undefined) {
            creep.memory.repairing = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.repairing) {
            creep.memory.repairing = false;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.repairing = true;
        }

        if (creep.memory.closestDamagedStructureId) {
            creep.memory.idle = undefined;
            if (creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.repairing) {
                if (creep.repair(Game.getObjectById(creep.memory.closestDamagedStructureId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestDamagedStructureId))
                }
            }
        }

        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.repairing) {
            creep.memory.idle = undefined;
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