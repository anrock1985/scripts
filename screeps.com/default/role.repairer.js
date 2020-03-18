let roleRepairer = {
    assign: function (creep) {
        let _ = require('lodash');

        let debug = true;

        let storagePoolController = require('storagePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (creep.memory.repairing === undefined) {
            creep.memory.repairing = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.repairing) {
            creep.memory.repairing = false;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.repairing) {
            creep.memory.repairing = true;
            storagePoolController.releaseWithdraw(creep);
        }

        if (!creep.memory.closestDamagedStructureId) {
            creep.memory.closestDamagedStructureId = {};
        }

        let bigStorages = {};
        let storage = {};
        if (creep.memory.reservedStorageResource && !creep.memory.reservedStorageResource.id && !creep.memory.upgrading) {
            //В первую очередь выгребаем container и storage
            for (let s in creep.room.memory.storageResourcePool) {
                let st = creep.room.memory.storageResourcePool[s];
                if (st.storageType === STRUCTURE_CONTAINER || st.storageType === STRUCTURE_STORAGE)
                    bigStorages[s] = {
                        id: s,
                        storageType: st.structureType,
                        type: RESOURCE_ENERGY,
                        amount: st.amount
                    };
            }
            if (bigStorages && creep.room.memory.storageResourcePool) {
                storage = findClosestStorageResourceByPath(creep, bigStorages);

            } else if (creep.room.memory.storageResourcePool)
                storage = findClosestStorageResourceByPath(creep, creep.room.memory.storageResourcePool);
            if (storage && storage.id && !creep.memory.repairing) {
                storagePoolController.reserveWithdraw(creep, storage.id, storage.resourceType, creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        }

        if (creep.memory.reservedStorageResource && !creep.memory.closestDamagedStructureId.id && creep.memory.repairing) {
            let damagedStructure = {};

            if (creep.room.memory.myDamagedRamparts.length > 0 && creep.room.memory.myDamagedRamparts.length > 0) {
                damagedStructure = findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedRamparts));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedStructuresIds));
            }
            if (!damagedStructure && creep.room.memory.myDamagedFortifications && creep.room.memory.myDamagedFortifications.length > 0) {
                damagedStructure = findClosestIdByPath(creep, damageStepCalculator(creep.room.memory.myDamagedFortifications));
            }
            if (!damagedStructure && creep.room.memory.myDamagedStructuresIds.length > 0) {
                damagedStructure = findClosestIdByPath(creep.room.memory.myDamagedStructuresIds);
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

        function findClosestStorageResourceByPath(creep, storagesIds) {
            let closest;
            let tmp;
            let storages = [];
            for (let s in storagesIds) {
                if (storagesIds[s].amount >= creep.store.getFreeCapacity(RESOURCE_ENERGY))
                    storages.push(Game.getObjectById(storagesIds[s].id));
            }

            if (storages.length === 0) {
                return undefined;
            }
            tmp = creep.pos.findClosestByPath(storages);
            if (tmp === null)
                return undefined;
            else
                closest = tmp;

            return {id: closest.id, resourceType: RESOURCE_ENERGY, amount: closest.store[RESOURCE_ENERGY]};
        }

        function findClosestIdByPath(creep, ids) {
            let closest;
            let tmp;
            let idsObjects = [];
            for (let s in ids) {
                idsObjects.push(Game.getObjectById(ids[s]));
            }

            tmp = creep.pos.findClosestByPath(idsObjects);
            if (tmp === null)
                return undefined;
            else
                closest = tmp;

            return {id: closest.id};
        }

        function damageStepCalculator(structures) {
            let result = [];
            for (let count = 0; count < 100000; count += 1000) {
                for (let s in structures) {
                    if (structures[s].hits < count) {
                        result.push(structures[s].id);
                        console.log(count + ", " + result);
                        return result;
                    }
                }
            }
        }
    }
};

module.exports = roleRepairer;