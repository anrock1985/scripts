let roomInit = {
    init: function (room) {

        let sources = room.find(FIND_SOURCES);
        if (sources) {
            if (!room.memory.sourceIds) {
                room.memory.sourceIds = [];
            }
            room.memory.sourceIds = [];
            for (let s in sources) {
                room.memory.sourceIds.push(sources[s].id)
            }
        }

        let myConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (myConstructionSites) {
            if (!room.memory.myConstructionSiteIds) {
                room.memory.myConstructionSiteIds = [];
            }
            room.memory.myConstructionSiteIds = [];
            for (let s in myConstructionSites) {
                room.memory.myConstructionSiteIds.push(myConstructionSites[s].id)
            }
        }

        let droppedEnergy = room.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType === RESOURCE_ENERGY
            }
        });
        if (droppedEnergy) {
            room.memory.droppedEnergyIds = [];
            for (let e in droppedEnergy) {
                room.memory.droppedEnergyIds.push(droppedEnergy[e].id)
            }
        }

        let mySpawners = room.find(FIND_MY_SPAWNS);
        if (mySpawners) {
            if (!room.memory.mySpawnerIds) {
                room.memory.mySpawnerIds = [];
                console.log("WARN: No room.memory.mySpawnerIds found, setting it to []");
            }
            room.memory.mySpawnerIds = [];
            for (let s in mySpawners) {
                room.memory.mySpawnerIds.push(mySpawners[s].id);
            }
        } else {
            console.log("WARN: No spawners found in room " + room + "!");
        }

        let myTowers = room.find(FIND_MY_STRUCTURES, {filter: (s) => {return s.structureType === STRUCTURE_TOWER}});
        if (myTowers) {
            room.memory.myTowerIds = [];
            for (let t in myTowers) {
                room.memory.myTowerIds.push(myTowers[t].id);
            }
        }

        let enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
        if (enemyCreeps) {
            room.memory.enemyCreepsIds = [];
            for (let c in enemyCreeps) {
                room.memory.enemyCreepsIds.push(enemyCreeps[c].id);
            }
        }

        //TODO: Добавить сломанные структуры.

        //TODO: Добавить раненых крипов.
    }
};
module.exports = roomInit;