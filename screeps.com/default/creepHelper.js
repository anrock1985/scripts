let _ = require('lodash');

let storagePoolController = require('storagePoolController');

function getClosestStorageForWorker(creep) {
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

    Memory.debugIdsObjects = idsObjects;
    
    tmp = creep.pos.findClosestByPath(idsObjects);
    if (tmp === null)
        return undefined;
    else
        closest = tmp;

    console.log(closest.id);
    return {id: closest.id};
}

function findClosestIdByRange(creep, ids) {
    let closest;
    let tmp;
    let idsObjects = [];
    for (let s in ids) {
        idsObjects.push(Game.getObjectById(ids[s]));
    }

    tmp = creep.pos.findClosestByRange(idsObjects);
    if (tmp === null)
        return undefined;
    else
        closest = tmp;

    return {id: closest.id};
}

function checkWorkerState(creep) {
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
}

function assignClosestStorageToTransfer(creep) {
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

function damageStepCalculator(structuresIds) {
    let result = [];
    for (let count = 0; count < 100000; count += 1000) {
        for (let s in structuresIds) {
            if (Game.getObjectById(structuresIds[s]).hits < count) {
                result.push(Game.getObjectById(structuresIds[s]).id);
                return result;
            }
        }
    }
}

module.exports = {
    getClosestStorageForWorker,
    findClosestIdByPath,
    findClosestIdByRange,
    checkWorkerState,
    assignClosestStorageToTransfer,
    damageStepCalculator
};
