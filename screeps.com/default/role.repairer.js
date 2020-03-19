let roleRepairer = {
    assign: function (creep) {
        let _ = require('lodash');

        let creepHelper = require('creepHelper');

        creepHelper.checkWorkerState(creep);

        if (!creep.memory.closestDamagedStructureId) {
            creep.memory.closestDamagedStructureId = {};
        }

        creepHelper.getClosestStorageForWorker(creep);

        if (creep.memory.reservedStorageResource && !creep.memory.closestDamagedStructureId.id && creep.memory.repairing) {
            let damagedStructure = {};

            if (creep.room.memory.myDamagedRampartsIds && creep.room.memory.myDamagedRampartsIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, creepHelper.damageStepCalculator(creep.room.memory.myDamagedRampartsIds));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, creepHelper.damageStepCalculator(creep.room.memory.myDamagedStructuresIds));
            }
            if (!damagedStructure && creep.room.memory.myDamagedFortificationsIds && creep.room.memory.myDamagedFortificationsIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, creepHelper.damageStepCalculator(creep.room.memory.myDamagedFortificationsIds));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, creep.room.memory.myDamagedStructuresIds);
            }

            if (damagedStructure && damagedStructure.id) {
                creep.memory.closestDamagedStructureId = damagedStructure.id;
            }
        }

        if (creep.memory.closestDamagedStructureId.id && creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.repairing) {
            creep.memory.idle = undefined;
            if (creep.repair(Game.getObjectById(creep.memory.closestDamagedStructureId.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestDamagedStructureId.id))
            }
            creep.memory.closestDamagedStructureId = {};
        }

        if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.repairing) {
            creep.memory.idle = undefined;
            if (creep.memory.reservedStorageResource.storageType === STRUCTURE_CONTAINER
                || creep.memory.reservedStorageResource.storageType === STRUCTURE_STORAGE) {
                if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
                }
            } else if (creep.room.energyAvailable >= 300 && Memory.harvesters > 1) {
                if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
                }
            }
        }
    }
};

module.exports = roleRepairer;