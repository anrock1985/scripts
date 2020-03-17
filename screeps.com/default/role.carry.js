let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        let resourcePoolController = require('resourcePoolController');
        let storagePoolController = require('storagePoolController');

        let logLevel = "info";

        if (!creep.memory.idle) {
            creep.memory.idle = Game.time;
        }

        Memory.debugRoom = creep.room.memory;

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.carrying) {
            creep.memory.carrying = true;
            if (creep.memory.reservedResource) {
                resourcePoolController.release(creep);
            }
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.carrying) {
            creep.memory.carrying = false;
            storagePoolController.releaseTransfer(creep);
        }

        if (!creep.memory.reservedStorageSpace || !creep.memory.reservedStorageSpace.id && creep.memory.carrying) {
            let storage;
            let reservedAmount = creep.store[RESOURCE_ENERGY];

            let spawnerNotFull = [];
            let extensionNotFull = [];
            let towerNotHalfFull = [];
            let storageNotFull = [];

            towerNotHalfFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return a.storageType === STRUCTURE_TOWER
                    && ((creep.room.energyAvailable === creep.room.energyCapacityAvailable) ? a.amount > 0 : a.amount >= 500)
            });
            console.log(creep.room.energyAvailable);
            console.log(creep.room.energyCapacityAvailable);
            console.log(((creep.room.energyAvailable === creep.room.energyCapacityAvailable) ? "FIRST" : "SECOND"));

            if (towerNotHalfFull.length === 0) {
                extensionNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return a.storageType === STRUCTURE_EXTENSION
                        && a.amount > 0
                });
            }

            if (extensionNotFull.length === 0) {
                spawnerNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return a.storageType === STRUCTURE_SPAWN
                        && a.amount > 0
                });
            }

            if (spawnerNotFull.length === 0) {
                storageNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return (a.storageType !== STRUCTURE_SPAWN
                        && a.storageType !== STRUCTURE_EXTENSION
                        && a.storageType !== STRUCTURE_TOWER)
                        && a.amount > 0
                });
            }

            if (towerNotHalfFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, towerNotHalfFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else if (extensionNotFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, extensionNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else if (spawnerNotFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, spawnerNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else {
                storage = findClosestStorageSpaceByPath(creep, storageNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            }
        }

        if (/*creep.memory.reservedStorageSpace && */creep.memory.reservedStorageSpace.id) {
            creep.memory.idle = undefined;
            let resultCode = creep.transfer(Game.getObjectById(creep.memory.reservedStorageSpace.id), RESOURCE_ENERGY);
            if (resultCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageSpace.id));
            }
            if (resultCode === 0) {
                //Сбрасываем, на случай если хранилище не вместило весь наш store
                creep.memory.reservedStorageSpace = {};
            }
        }

        if ((Game.time % 10 === 0) && !creep.memory.carrying && creep.memory.reservedResource && creep.memory.reservedResource.id) {
            let some = _.find(creep.room.memory.resourcePool, function (a) {
                return a.id === creep.memory.reservedResource.id
            });
            if (!some) {
                console.log("WARN: Reserved resource " + creep.memory.reservedResource.id + " disappears");
                creep.memory.reservedResource = {};
            }
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

        if (creep.memory.reservedResource && creep.memory.reservedResource.id) {
            creep.memory.idle = undefined;
            if (creep.pickup(Game.getObjectById(creep.memory.reservedResource.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedResource.id))
            }
        }

        function findClosestStorageSpaceByPath(creep, storagesIds) {
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

            return {id: closest.id, amount: closest.store.getFreeCapacity(RESOURCE_ENERGY)};
        }
    }
};

module.exports = roleCarry;

//TODO: Если от ресурса до склада - дорога, строим только грузовики.

//TODO: Подбор соринок энергии оставшихся от трупов, если они не далеко от основного пути.

//TODO: Если загружены хоть чем-то, не ходить на дальний спот для полной загрузки.

//TODO: Учитывать ближайшие места выгрузки.