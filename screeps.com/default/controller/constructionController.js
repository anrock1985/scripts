let constructionController = {
    buildContainers: function (creep) {
        let debug = true;

        let _ = require('lodash');

        let numberOfContainersToBuild = 2;

        if (creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length < numberOfContainersToBuild) {
            let pendingConstructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => {return s.structureType === STRUCTURE_CONTAINER}});
            while (pendingConstructionSites.length === 0) {
                if (creep.room.createConstructionSite(Game.getObjectById(creep.memory.closestSpawnerId).pos.x + 1,
                    Game.getObjectById(creep.memory.closestSpawnerId).pos.y + 1,
                    STRUCTURE_CONTAINER) === ERR_INVALID_TARGET) {
                    if (creep.room.createConstructionSite(Game.getObjectById(creep.memory.closestSpawnerId).pos.x - 1,
                        Game.getObjectById(creep.memory.closestSpawnerId).pos.y - 1,
                        STRUCTURE_CONTAINER) === ERR_INVALID_TARGET) {
                        if (creep.room.createConstructionSite(Game.getObjectById(creep.memory.closestSpawnerId).pos.x + 1,
                            Game.getObjectById(creep.memory.closestSpawnerId).pos.y - 1,
                            STRUCTURE_CONTAINER) === ERR_INVALID_TARGET) {
                            if (creep.room.createConstructionSite(Game.getObjectById(creep.memory.closestSpawnerId).pos.x - 1,
                                Game.getObjectById(creep.memory.closestSpawnerId).pos.y + 1,
                                STRUCTURE_CONTAINER) === ERR_INVALID_TARGET) {
                                console.log("ERROR: Cannot create all " + numberOfContainersToBuild + " construction sites for Containers!");
                                break;
                            }
                        } else
                            break;
                    } else
                        break;
                } else
                    break;
            }
        }
    },

    buildExtensions: function (creep) {
        let numberOfExtensionsToBuild = 5;
        let closestSpawnerId = creep.pos.findClosestByRange(FIND_MY_SPAWNS).id;
        if (creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}}).length < numberOfExtensionsToBuild) {
            let pendingConstructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => {return s.structureType === STRUCTURE_EXTENSION}});
            while (pendingConstructionSites.length === 0) {
                if (creep.room.createConstructionSite(Game.getObjectById(closestSpawnerId).pos.x - 1,
                    Game.getObjectById(closestSpawnerId).pos.y + 2,
                    STRUCTURE_EXTENSION) === ERR_INVALID_TARGET) {
                    if (creep.room.createConstructionSite(Game.getObjectById(closestSpawnerId).pos.x - 1,
                        Game.getObjectById(closestSpawnerId).pos.y + 3,
                        STRUCTURE_EXTENSION) === ERR_INVALID_TARGET) {
                        if (creep.room.createConstructionSite(Game.getObjectById(closestSpawnerId).pos.x - 2,
                            Game.getObjectById(closestSpawnerId).pos.y + 2,
                            STRUCTURE_EXTENSION) === ERR_INVALID_TARGET) {
                            if (creep.room.createConstructionSite(Game.getObjectById(closestSpawnerId).pos.x - 2,
                                Game.getObjectById(closestSpawnerId).pos.y + 3,
                                STRUCTURE_EXTENSION) === ERR_INVALID_TARGET) {
                                if (creep.room.createConstructionSite(Game.getObjectById(closestSpawnerId).pos.x - 4,
                                    Game.getObjectById(closestSpawnerId).pos.y + 2,
                                    STRUCTURE_EXTENSION) === ERR_INVALID_TARGET) {
                                    console.log("ERROR: Cannot create all " + numberOfExtensionsToBuild + " construction sites for Containers!");
                                    break;
                                }
                            }
                        } else
                            break;
                    } else
                        break;
                } else
                    break;
            }
        }
    }
};

module.exports = constructionController;