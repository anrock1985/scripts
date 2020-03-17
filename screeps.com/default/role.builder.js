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

        if (!creep.memory.reservedStorageResource.id && !creep.memory.building) {
            let storage = {};
            if (creep.room.memory.storageResourcePool.id) {
                storage = findClosestStorageResourceByPath(creep, creep.room.memory.storageResourcePool);
            }
            if (storage.id && !creep.memory.building) {
                storagePoolController.reserveWithdraw(creep, storage.id, storage.resourceType, creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        }

        if (!creep.memory.closestConstructionSiteId.id && creep.memory.building) {
            let constructionSite = {};
            if (creep.room.memory.myConstructionSiteIds.length > 0) {
                constructionSite = findClosestIdByPath(creep, creep.room.memory.myConstructionSiteIds);
            }
            if (constructionSite.id) {
                creep.memory.closestConstructionSiteId.id = constructionSite.id;
            }
        }

        if (creep.memory.reservedStorageResource.id && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.building) {
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
                storages.push(Game.getObjectById(storagesIds[s].id));
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