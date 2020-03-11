let roleBuilder = {
    run: function (creep) {
        let constructionController = require('constructionController');

        let constructionSites;
        let closestConstructionSite;
        Memory.myConstructionSiteIds = [];

        constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

        if (constructionSites) {
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
        }

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
            }
        });

        let storagesWithEnoughEnergy = creep.pos.findClosestByRange(storages, {
            filter: (s) => {
                return s.store[RESOURCE_ENERGY] >= creep.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        if (storagesWithEnoughEnergy === null) {
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
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.building) {
            creep.memory.building = true;
        }

        if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.building) {
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
            if (creep.memory.closestConstructionSiteId && creep.build(Game.getObjectById(creep.memory.closestConstructionSiteId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestConstructionSiteId));
            }
        }

        constructionController.buildExtensions(creep);
    }
};

module.exports = roleBuilder;

//TODO: Ступенчатое строительство стен.