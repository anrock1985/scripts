let roleBuilder = {
    run: function (creep) {

        let _ = require('lodash');

        let storagePoolController = require('storagePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (creep.memory.building === undefined) {
            creep.memory.building = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.building) {
            creep.memory.building = false;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.building) {
            creep.memory.building = true;
            storagePoolController.releaseWithdraw(creep);
        }

        if (!creep.memory.closestConstructionSiteId) {
            creep.memory.closestConstructionSiteId = {};
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
            if (storage && storage.id && !creep.memory.building) {
                storagePoolController.reserveWithdraw(creep, storage.id, storage.resourceType, creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        }

        if (creep.memory.reservedStorageResource && !creep.memory.closestConstructionSiteId.id && creep.memory.building) {
            let constructionSite = {};
            if (creep.room.memory.myConstructionSiteIds.length > 0) {
                constructionSite = findClosestIdByPath(creep, creep.room.memory.myConstructionSiteIds);
            }
            if (constructionSite.id) {
                creep.memory.closestConstructionSiteId.id = constructionSite.id;
            }
        }

        if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.building) {
            creep.memory.idle = undefined;
            if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
            }
        }

        if (creep.memory.closestConstructionSiteId.id && creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.building) {
            creep.memory.idle = undefined;
            if (creep.build(Game.getObjectById(creep.memory.closestConstructionSiteId.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestConstructionSiteId.id));
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
    }
};

module.exports = roleBuilder;

//TODO: Ступенчатое строительство стен.