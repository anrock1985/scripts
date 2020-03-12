let roomInit = {
    init: function (room) {

        let resourcePoolController = require('resourcePoolController');

        room.memory.resourcePool = {};

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

        let myTowers = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_TOWER
            }
        });
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

        let myWoundedCreeps = room.find(FIND_MY_CREEPS, {
            filter: (c) => {
                return c.hits < c.hitsMax
            }
        });
        if (myWoundedCreeps) {
            room.memory.myWoundedCreepsIds = [];
            for (let c in myWoundedCreeps) {
                room.memory.myWoundedCreepsIds.push(myWoundedCreeps[c].id);
            }
        }

        let myDamagedStructures = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return ((s.structureType !== STRUCTURE_CONTROLLER) && (s.hits <= (s.hitsMax - (s.hitsMax / 6))));
            }
        });
        if (myDamagedStructures) {
            room.memory.myDamagedStructuresIds = [];
            for (let s in myDamagedStructures) {
                room.memory.myDamagedStructuresIds.push(myDamagedStructures[s].id);
            }
        }

        Memory.debugDroppedEnergy = droppedEnergy;

        if (droppedEnergy.length > 0) {
            for (let e in droppedEnergy) {
                let droppedEnergyId = droppedEnergy[e].id;
                let droppedEnergyAmount = droppedEnergy[e].energy;
                room.memory.resourcePool[droppedEnergyId] = {type: RESOURCE_ENERGY, amount: droppedEnergyAmount};
            }
        }

        Memory.debugResourcePoolTotal = room.memory.resourcePool;

        Memory.debugRoomCreeps = room.memory.creeps;

        actualizeRoomResourcePool(room);

        Memory.debugResourcePoolActual = room.memory.resourcePool;

        function actualizeRoomResourcePool(room) {
            // for (let c in Game.creeps) {
            //     if (room.name === Game.creeps[c].memory.currentRoomName) {
            //         room.memory
            //     }
            // }
            for (let c in room.creeps) {
                let creepReservedResourceId = room.creeps[c].memory.reservedResource.id;
                if (room.memory.resourcePool[creepReservedResourceId]) {
                    room.memory.resourcePool[creepReservedResourceId].amount -= room.creeps[c].memory.reservedResource.amount;
                }
            }
        }

        //TODO: Добавить отдельно сломанные структуры с большим кол-вом HP.

        //TODO: Хранение для каждой комнаты отдельно.
    }
};
module.exports = roomInit;