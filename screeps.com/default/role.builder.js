let roleBuilder = {
    run: function (creep) {

        let _ = require('lodash');

        let creepHelper = require('creepHelper');

        creepHelper.checkWorkerState(creep);

        if (creep.room.memory.myConstructionSiteIds.length === 0) {
            creep.memory.newRole = "repairer";
        }

        if (!creep.memory.closestConstructionSiteId) {
            creep.memory.closestConstructionSiteId = {};
        }

        creepHelper.getClosestStorageForWorker(creep);

        if (creep.memory.reservedStorageResource && !creep.memory.closestConstructionSiteId.id && creep.memory.building) {
            let constructionSite = {};
            if (creep.room.memory.myConstructionSiteIds.length > 0) {
                constructionSite = creepHelper.findClosestIdByPath(creep, creep.room.memory.myConstructionSiteIds);
            }
            if (constructionSite && constructionSite.id) {
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
            creep.memory.closestConstructionSiteId = {};
        }
    }
};

module.exports = roleBuilder;
