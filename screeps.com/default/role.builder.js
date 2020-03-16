let roleBuilder = {
    run: function (creep) {

        let _ = require('lodash');

        let constructionController = require('constructionController');
        let storagePoolController = require('storagePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        let constructionSites;
        let closestConstructionSite;

        constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

        if (constructionSites.length > 0) {
            for (let c in constructionSites) {
                if (!Memory.myConstructionSiteIds) {
                    Memory.myConstructionSiteIds = [];
                }
                Memory.myConstructionSiteIds.push(constructionSites[c].id);
            }
            closestConstructionSite = creep.pos.findClosestByRange(constructionSites);
            if (closestConstructionSite) {
                creep.memory.closestConstructionSiteId = closestConstructionSite.id;
            } else {
                creep.memory.closestConstructionSiteId = undefined;
            }
        } else {
            creep.memory.newRole = "repairer";
        }

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_STORAGE)
                    && s.store[RESOURCE_ENERGY] >= (creep.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        });

        let storagesWithEnoughEnergy = {};
        if (storages) {
            storagesWithEnoughEnergy = creep.pos.findClosestByRange(storages);
        }

        if (!storagesWithEnoughEnergy) {
            creep.memory.closestStorageId = undefined;
        } else {
            creep.memory.closestStorageId = storagesWithEnoughEnergy.id;
        }

        if (creep.memory.building === undefined) {
            creep.memory.building = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.building) {
            creep.memory.building = false;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.building) {
            creep.memory.building = true;
        }

        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.building) {
            creep.memory.idle = undefined;
            if (creep.memory.closestStorageId) {
                if (storagesWithEnoughEnergy.structureType === STRUCTURE_CONTAINER) {
                    if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                    }
                } else if (creep.room.energyAvailable >= 300 && Memory.harvesters > 1) {
                    if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                    }
                }
            }
        }

        if (creep.memory.closestConstructionSiteId && creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.building) {
            creep.memory.idle = undefined;
            if (creep.memory.closestConstructionSiteId && creep.build(Game.getObjectById(creep.memory.closestConstructionSiteId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestConstructionSiteId));
            }
        }

        constructionController.buildExtensions(creep);
    }
};

module.exports = roleBuilder;

//TODO: Ступенчатое строительство стен.