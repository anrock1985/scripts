let roleUpgrader = {
    run: function (creep) {
        let _ = require('lodash');

        let storagePoolController = require('storagePoolController');

        if (creep.memory.upgrading === undefined) {
            creep.memory.upgrading = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.upgrading) {
            creep.memory.upgrading = false;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.upgrading) {
            creep.memory.upgrading = true;
            storagePoolController.releaseWithdraw(creep);
        }

        let closestSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (closestSpawner) {
            creep.memory.closestSpawnerId = closestSpawner.id;
        }

        let storages = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN)
                    && s.store[RESOURCE_ENERGY] >= (creep.store.getCapacity(RESOURCE_ENERGY) - creep.store[RESOURCE_ENERGY])
            }
        });

        let storagesWithEnoughEnergy = {};
        if (storages) {
            storagesWithEnoughEnergy = creep.pos.findClosestByPath(storages);
        }

        if (!storagesWithEnoughEnergy) {
            creep.memory.closestStorageId = undefined;
        } else {
            creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        }

        if (!creep.memory.reservedStorageResource || !creep.memory.reservedStorageResource.id && !creep.memory.upgrading) {
            let storage;
            let reservedAmount;
            for (let s in creep.room.memory.storageResourcePool) {
                storage = creep.room.memory.storageResourcePool[s];
                reservedAmount = creep.store.getCapacity(RESOURCE_ENERGY) - creep.store[RESOURCE_ENERGY];
                if (storage.amount >= reservedAmount) {
                    storagePoolController.reserveWithdraw(creep, storage[storage],
                        storage.resourceType,
                        reservedAmount);
                }
            }
        }

        if (creep.memory.reservedStorageResource) {
            if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
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