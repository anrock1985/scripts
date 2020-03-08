let roleBuilder = {
    run: function (creep) {
        let constructionController = require('constructionController');

        creep.memory.closestConstructionSiteId = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES).id;

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
        creep.memory.closestStorageId = storagesWithEnoughEnergy.id;

        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            if (storagesWithEnoughEnergy.structureType === STRUCTURE_CONTAINER) {
                if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                }
            } else if (creep.room.energyAvailable >= 300 && Memory.harvesters > 1) {
                if (creep.withdraw(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
                }
            }
        } else {
            creep.memory.building = true;
            if (creep.memory.closestConstructionSiteId && creep.build(Game.getObjectById(creep.memory.closestConstructionSiteId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestConstructionSiteId));
            }
        }

        constructionController.buildExtensions(creep);
    }
};

module.exports = roleBuilder;