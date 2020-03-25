let roleRepairer = {
    assign: function (creep) {
        let _ = require('lodash');

        let creepHelper = require('creepHelper');

        creepHelper.checkWorkerState(creep);

        if (!creep.memory.closestDamagedStructureId) {
            creep.memory.closestDamagedStructureId = [];
        }

        creepHelper.getClosestStorageForWorker(creep);

        if (creep.memory.reservedStorageResource && creep.memory.closestDamagedStructureId.length === 0 && creep.memory.working) {
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

        if (creep.memory.closestDamagedStructureId.length > 0 && creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.working) {
            creep.memory.idle = undefined;
            let resultCode = creep.repair(Game.getObjectById(creep.memory.closestDamagedStructureId));
            if (resultCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestDamagedStructureId))
            } else if (resultCode === OK
                && (Game.getObjectById(creep.memory.closestDamagedStructureId).hits === Game.getObjectById(creep.memory.closestDamagedStructureId).hitsMax
                    || creep.store[RESOURCE_ENERGY] === 0)) {
                creep.memory.closestDamagedStructureId = [];
            }
        }

        if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.working) {
            creep.memory.idle = undefined;
            if (creep.memory.reservedStorageResource.storageType === STRUCTURE_CONTAINER
                || creep.memory.reservedStorageResource.storageType === STRUCTURE_STORAGE) {
                if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
                }
            } else if (creep.room.energyAvailable >= 300 && creep.room.memory.harvesters > 1) {
                if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
                }
            }
        }
    }
};

module.exports = roleRepairer;