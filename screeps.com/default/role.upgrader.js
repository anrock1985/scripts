let roleUpgrader = {
    run: function (creep) {
        let _ = require('lodash');

        let storagePoolController = require('storagePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (creep.memory.upgrading === undefined) {
            creep.memory.upgrading = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.upgrading) {
            creep.memory.upgrading = false;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.upgrading) {
            creep.memory.upgrading = true;
            storagePoolController.releaseWithdraw(creep);
        }

        // let closestSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        // if (closestSpawner) {
        //     creep.memory.closestSpawnerId = closestSpawner.id;
        // }
        //
        // let storages = creep.room.find(FIND_MY_STRUCTURES, {
        //     filter: (s) => {
        //         return (s.structureType === STRUCTURE_EXTENSION
        //             || s.structureType === STRUCTURE_CONTAINER
        //             || s.structureType === STRUCTURE_STORAGE)
        //             && s.store[RESOURCE_ENERGY] >= (creep.store.getFreeCapacity(RESOURCE_ENERGY))
        //     }
        // });
        //
        // let storagesWithEnoughEnergy = {};
        // if (storages) {
        //     storagesWithEnoughEnergy = creep.pos.findClosestByPath(storages);
        // }
        //
        // if (!storagesWithEnoughEnergy) {
        //     creep.memory.closestStorageId = undefined;
        // } else {
        //     creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        // }
        //
        // if (!creep.memory.reservedStorageResource || !creep.memory.reservedStorageResource.id && !creep.memory.upgrading && creep.room.energyAvailable >= 300) {
        //     let storage;
        //     let reservedAmount;
        //     for (let s in creep.room.memory.storageResourcePool) {
        //         storage = creep.room.memory.storageResourcePool[s];
        //         reservedAmount = creep.store.getFreeCapacity(RESOURCE_ENERGY);
        //         if (storage.amount >= reservedAmount) {
        //             storagePoolController.reserveWithdraw(creep, storage.id,
        //                 storage.resourceType,
        //                 reservedAmount);
        //             break;
        //         }
        //     }
        // }

        if (!creep.memory.reservedStorageResource.id && !creep.memory.upgrading) {
            let storage = {};
            if (creep.room.memory.storageResourcePool.id) {
                storage = findClosestStorageResourceByPath(creep, creep.room.memory.storageResourcePool);
            }
            if (storage.id && !creep.memory.upgrading) {
                storagePoolController.reserveWithdraw(creep, storage.id, storage.resourceType, creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        }

        if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id) {
            creep.memory.idle = undefined;
            if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
            }
        }

        if (creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.upgrading) {
            creep.memory.idle = undefined;
            if (creep.upgradeController(Game.getObjectById(creep.room.controller.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.room.controller.id));
            }
        }

        function findClosestStorageResourceByPath(creep, storagesIds) {
            let closest;
            let tmp;
            let storages = [];
            for (let s in storagesIds) {
                storages.push(Game.getObjectById(storagesIds[s].id));
            }

            tmp = creep.pos.findClosestByPath(storages);
            if (tmp === null)
                return undefined;
            else
                closest = tmp;

            return {id: closest.id, resourceType: RESOURCE_ENERGY, amount: closest.store[RESOURCE_ENERGY]};
        }
    }
};

module.exports = roleUpgrader;

//TODO: Проверка что ресурс за которым идем в хранилище не пропал (например потрачен на спавн)
