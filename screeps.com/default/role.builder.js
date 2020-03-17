let roleBuilder = {
    run: function (creep) {

        let _ = require('lodash');

        // let constructionController = require('constructionController');
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

        // let constructionSites;
        // let closestConstructionSite;
        //
        // constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        //
        // Memory.myConstructionSiteIds = [];
        // if (constructionSites.length > 0) {
        //     for (let c in constructionSites) {
        //         Memory.myConstructionSiteIds.push(constructionSites[c].id);
        //     }
        //     closestConstructionSite = creep.pos.findClosestByRange(constructionSites);
        //     if (closestConstructionSite) {
        //         creep.memory.closestConstructionSiteId = closestConstructionSite.id;
        //     } else {
        //         creep.memory.closestConstructionSiteId = undefined;
        //     }
        // } else {
        //     creep.memory.newRole = "repairer";
        // }
        //
        // let storages = creep.room.find(FIND_STRUCTURES, {
        //     filter: (s) => {
        //         return (s.structureType === STRUCTURE_EXTENSION
        //             || s.structureType === STRUCTURE_CONTAINER
        //             || s.structureType === STRUCTURE_SPAWN
        //             || s.structureType === STRUCTURE_STORAGE)
        //             && s.store[RESOURCE_ENERGY] >= (creep.store.getFreeCapacity(RESOURCE_ENERGY))
        //     }
        // });

        // let storagesWithEnoughEnergy = {};
        // if (storages) {
        //     storagesWithEnoughEnergy = creep.pos.findClosestByRange(storages);
        // }

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
            if (creep.room.memory.myConstructionSiteIds.id) {
                constructionSite = findClosestConstructionSiteByPath(creep, creep.room.memory.myConstructionSiteIds);
            }
            if (constructionSite.id) {
                creep.memory.closestConstructionSiteId.id = constructionSite.id;
            }
        }

        // if (!storagesWithEnoughEnergy) {
        //     creep.memory.closestStorageId = undefined;
        // } else {
        //     creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        // }

        // if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && !creep.memory.building) {
        //     if (creep.memory.closestStorageId) {
        //         creep.memory.idle = undefined;
        //         if (storagesWithEnoughEnergy.structureType === STRUCTURE_CONTAINER) {
        //             if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        //                 creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
        //             }
        //         } else if (creep.room.energyAvailable >= 300 && Memory.harvesters > 1) {
        //             if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        //                 creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
        //             }
        //         }
        //     }
        // }
        //
        // if (creep.memory.closestConstructionSiteId && creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.building) {
        //     creep.memory.idle = undefined;
        //     if (creep.memory.closestConstructionSiteId && creep.build(Game.getObjectById(creep.memory.closestConstructionSiteId)) === ERR_NOT_IN_RANGE) {
        //         creep.moveTo(Game.getObjectById(creep.memory.closestConstructionSiteId));
        //     }
        // }

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

        // constructionController.buildExtensions(creep);

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

        function findClosestConstructionSiteByPath(creep, constructionSitesIds) {
            let closest;
            let tmp;
            let constructionSites = [];
            for (let s in constructionSitesIds) {
                constructionSites.push(Game.getObjectById(constructionSitesIds[s].id));
            }

            tmp = creep.pos.findClosestByPath(constructionSites);
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