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

    tmp = creep.pos.findClosestByPath(idsObjects);
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

module.exports = {
    getClosestStorageForWorker,
    findClosestIdByPath,
    checkWorkerState
};
