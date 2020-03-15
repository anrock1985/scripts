let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        let resourcePoolController = require('resourcePoolController');
        let storagePoolController = require('storagePoolController');

        let logLevel = "info";

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.carrying) {
            creep.memory.carrying = true;
            creep.memory.closestDroppedEnergyId = undefined;
            if (creep.memory.reservedResource) {
                resourcePoolController.release(creep);
            }
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.carrying) {
            creep.memory.carrying = false;
            storagePoolController.releaseTransfer(creep);
        }

        let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType === RESOURCE_ENERGY
            }
        });

        //TODO: Заполнять не только крупные, но и те хранилища у которых объем меньше переносимого объема.

        //
        if (!creep.memory.reservedStorageSpace || !creep.memory.reservedStorageSpace.id && creep.memory.carrying) {
            let storage;
            let reservedAmount = creep.store[RESOURCE_ENERGY];

            let spawnerNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return a.storageType === STRUCTURE_SPAWN
                    && a.amount >= 50
            });
            let extensionNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return a.storageType === STRUCTURE_EXTENSION
                    && a.amount >= 50
            });
            let towerNotHalfFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return a.storageType === STRUCTURE_TOWER
                    && a.amount >= 50
            });
            let storageNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return (a.storageType !== STRUCTURE_SPAWN
                    && a.storageType !== STRUCTURE_EXTENSION
                    && a.storageType !== STRUCTURE_TOWER)
                    && a.amount >= 50
            });

            if (towerNotHalfFull.length > 0) {
                storage = towerNotHalfFull[0];
                if (storage.amount >= reservedAmount) {
                    storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                } else {
                    storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                }
            } else if (extensionNotFull.length > 0) {
                storage = extensionNotFull[0];
                if (storage.amount >= reservedAmount) {
                    storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                } else {
                    storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                }
            } else if (spawnerNotFull.length > 0) {
                storage = spawnerNotFull[0];
                if (storage.amount >= reservedAmount) {
                    storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                } else {
                    storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                }
            } else {
                storage = storageNotFull[0];
                if (storage.amount >= reservedAmount) {
                    storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                } else {
                    storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                }
            }
        }

        if (creep.memory.reservedStorageSpace && creep.memory.reservedStorageSpace.id) {
            let resultCode = creep.transfer(Game.getObjectById(creep.memory.reservedStorageSpace.id), RESOURCE_ENERGY);
            if (resultCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageSpace.id));
            }
            if (resultCode === 0) {
                creep.memory.reservedStorageSpace = {};
            }
        }

        if (!creep.memory.carrying && creep.memory.reservedResource && creep.memory.reservedResource.id) {
            if (!_.some(creep.room.memory.resourcePool, creep.memory.reservedResource.id)) {
                console.log("WARN: Reserved resource disappears");
                creep.memory.reservedResource = {};
            }
            // let filteredDrops = droppedEnergy.filter(function (a) {
            //     return a.id === creep.memory.reservedResource.id;
            // });
            // if (filteredDrops.length === 0) {
            //     console.log("WARN: Reserved resource disappears");
            //     creep.memory.reservedResource = {};
            // }
        }

        if (!creep.memory.reservedResource || !creep.memory.reservedResource.id && !creep.memory.carrying) {
            for (let r in creep.room.memory.resourcePool) {
                let droppedEnergy = creep.room.memory.resourcePool[r];
                if (droppedEnergy.amount >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    resourcePoolController.reserve(creep, droppedEnergy.id,
                        droppedEnergy.resourceType,
                        creep.store.getFreeCapacity(RESOURCE_ENERGY));
                }
            }
        }

        if (creep.memory.reservedResource) {
            if (creep.pickup(Game.getObjectById(creep.memory.reservedResource.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedResource.id))
            }
        }
    }
};

module.exports = roleCarry;

//TODO: Если от ресурса до склада - дорога, строим только грузовики.

//TODO: Подбор соринок энергии оставшихся от трупов, если они не далеко от основного пути.

//TODO: Если загружены хоть чем-то, не ходить на дальний спот для полной загрузки.
