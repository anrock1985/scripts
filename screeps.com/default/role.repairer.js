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

            if (creep.room.memory.myDamagedRamparts && creep.room.memory.myDamagedRamparts.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedRamparts));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedStructuresIds));
            }
            if (!damagedStructure && creep.room.memory.myDamagedFortifications && creep.room.memory.myDamagedFortifications.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedFortifications));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = creepHelper.findClosestIdByPath(creep, creep.room.memory.myDamagedStructuresIds);
            }

            if (damagedStructure && damagedStructure.id) {
                creep.memory.closestDamagedStructureId.id = damagedStructure.id;
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

        function damageStepCalculator(structures) {
            let result = [];
            for (let count = 0; count < 100000; count += 1000) {
                for (let s in structures) {
                    if (structures[s].hits < count) {
                        result.push(structures[s].id);
                        return result;
                    }
                }
            }
        }
    }
};

module.exports = roleRepairer;