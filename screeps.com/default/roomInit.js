let roomInit = {
    init: function (room) {
        let _ = require('lodash');

        let resourcePoolController = require('resourcePoolController');
        let storagePoolController = require('storagePoolController');

        room.memory.resourcePool = {};
        room.memory.storageResourcePool = {};
        room.memory.storageSpacePool = {};

        room.memory.harvesters = 0;
        room.memory.carrys = 0;
        room.memory.upgraders = 0;
        room.memory.builders = 0;
        room.memory.repairers = 0;
        room.memory.scouts = 0;
        room.memory.warriors = 0;
        room.memory.claimers = 0;

        room.memory.creeps = [];
        for (let c in Game.creeps) {
            console.log("room.name = " + room.name + " , " + "Game.creeps[c].room.name = " + Game.creeps[c].room.name);
            if (room.name === Game.creeps[c].room.name) {
                room.memory.creeps.push(Game.creeps[c].id);
                switch (Game.creeps[c].memory.role) {
                    case "harvester":
                        room.memory.harvesters++;
                        break;
                    case "carry":
                        room.memory.carrys++;
                        break;
                    case "upgrader":
                        room.memory.upgraders++;
                        break;
                    case "builder":
                        room.memory.builders++;
                        break;
                    case "repairer":
                        room.memory.repairers++;
                        break;
                    case "scout":
                        room.memory.scouts++;
                        break;
                    case "warrior":
                        room.memory.warriors++;
                        break;
                    case "claimer":
                        room.memory.claimers++;
                        break;
                }
            }
        }

        let sources = room.find(FIND_SOURCES);
        if (sources) {
            room.memory.sourceIds = [];
            for (let s in sources) {
                room.memory.sourceIds.push(sources[s].id)
            }
        }

        let storages = room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
                    || s.structureType === STRUCTURE_TOWER
                    || s.structureType === STRUCTURE_STORAGE)
            }
        });
        if (storages) {
            room.memory.storagesIds = [];
            for (let s in storages) {
                room.memory.storagesIds.push(storages[s].id)
            }
        }

        let myConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        if (myConstructionSites) {
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

        let tombstonesWithEnergy = room.find(FIND_TOMBSTONES, {
            filter: (t) => {
                return t.store.getUsedCapacity(RESOURCE_ENERGY) > 50
            }
        });
        if (tombstonesWithEnergy) {
            room.memory.tombstonesWithEnergyIds = [];
            for (let t in tombstonesWithEnergy) {
                room.memory.tombstonesWithEnergyIds.push(tombstonesWithEnergy[t].id)
            }
        }

        let mySpawners = room.find(FIND_MY_SPAWNS);
        if (mySpawners) {
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

        let enemyTowers = room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_TOWER
            }
        });
        if (enemyTowers) {
            room.memory.enemyTowerIds = [];
            for (let t in enemyTowers) {
                room.memory.enemyTowerIds.push(enemyTowers[t].id);
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

        room.memory.myDamagedStructuresIds = [];
        room.memory.myDamagedFortificationsIds = [];
        room.memory.myDamagedRampartsIds = [];
        let myDamagedStructures = room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType !== STRUCTURE_CONTROLLER) && (s.hits < s.hitsMax);
            }
        });
        if (myDamagedStructures) {
            let myDamagedFortifications;
            let myDamagedRamparts;
            for (let s in myDamagedStructures) {
                room.memory.myDamagedStructuresIds.push(myDamagedStructures[s].id);
            }
            myDamagedFortifications = _.filter(myDamagedStructures, function (s) {
                return s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART
            });

            if (myDamagedFortifications) {
                for (let f in myDamagedFortifications) {
                    room.memory.myDamagedFortificationsIds.push(myDamagedFortifications[f].id);
                }
                myDamagedRamparts = _.filter(myDamagedFortifications, function (s) {
                    return s.structureType === STRUCTURE_RAMPART
                });
            }

            if (myDamagedRamparts) {
                for (let r in myDamagedRamparts) {
                    room.memory.myDamagedRampartsIds.push(myDamagedRamparts[r].id);
                }
            }
        }

        //Вычисляем количество каждого брошенного ресурса в комнате
        if (droppedEnergy.length > 0 || tombstonesWithEnergy.length > 0) {
            let totalDroppedEnergyInRoom = 0;
            for (let e in droppedEnergy) {
                let droppedEnergyId = droppedEnergy[e].id;
                let droppedEnergyAmount = droppedEnergy[e].amount;
                totalDroppedEnergyInRoom += droppedEnergyAmount;
                room.memory.resourcePool[droppedEnergyId] = {
                    id: droppedEnergyId,
                    type: RESOURCE_ENERGY,
                    amount: droppedEnergyAmount
                };
            }
            if (tombstonesWithEnergy.length > 0) {
                for (let t in tombstonesWithEnergy) {
                    let tombstonesWithEnergyId = tombstonesWithEnergy[t].id;
                    let tombstonesWithEnergyAmount = tombstonesWithEnergy[t].amount;
                    totalDroppedEnergyInRoom += tombstonesWithEnergyAmount;
                    room.memory.resourcePool[tombstonesWithEnergyId] = {
                        id: tombstonesWithEnergyId,
                        type: RESOURCE_ENERGY,
                        amount: tombstonesWithEnergyAmount
                    };
                }
            }
            room.memory.totalDroppedEnergyInRoom = totalDroppedEnergyInRoom;
        }

        //Вычисляем параметры каждого хранилища в комнате
        if (storages.length > 0) {
            for (let s in storages) {
                let storageId = storages[s].id;
                let storageSpaceUsed = storages[s].store[RESOURCE_ENERGY];
                let storageSpaceAvailable = storages[s].store.getFreeCapacity(RESOURCE_ENERGY);
                if (storages[s].structureType !== STRUCTURE_TOWER) {
                    room.memory.storageResourcePool[storageId] = {
                        id: storageId,
                        storageType: storages[s].structureType,
                        type: RESOURCE_ENERGY,
                        amount: storageSpaceUsed
                    };
                }
                room.memory.storageSpacePool[storageId] = {
                    id: storageId,
                    storageType: storages[s].structureType,
                    amount: storageSpaceAvailable
                };
            }
        }

        actualizeRoomResourcePool(room);
        actualizeRoomStoragePool(room);

        if (!room.memory.totalAvailableResourcePool) {
            room.memory.totalAvailableResourcePool = 0;
        }
        if (room.memory.resourcePool) {
            let totalAvailableResourcePool = 0;
            for (let e in room.memory.resourcePool) {
                if (room.memory.resourcePool[e].amount > 0) {
                    totalAvailableResourcePool += room.memory.resourcePool[e].amount;
                }
            }
            room.memory.totalAvailableResourcePool = totalAvailableResourcePool;
        }
        Memory.debugRoom = room.memory;

        //TODO: Optimize
        function actualizeRoomResourcePool(room) {
            if (room.memory.creeps.length > 0) {
                room.memory.availableDroppedEnergyInRoom = 0;
                for (let i = 0; i < room.memory.creeps.length; i++) {
                    let creep = Game.getObjectById(room.memory.creeps[i]);
                    if (creep.memory.role === "carry") {
                        resourcePoolController.check(creep);
                        let creepReservedResourceId = creep.memory.reservedResource.id;
                        if (room.memory.resourcePool[creepReservedResourceId]) {
                            room.memory.resourcePool[creepReservedResourceId].amount -= Game.getObjectById(room.memory.creeps[i]).memory.reservedResource.amount;
                        }
                    }
                }
                for (let r in room.memory.resourcePool) {
                    room.memory.availableDroppedEnergyInRoom += room.memory.resourcePool[r].amount;
                }
            }
        }

        //TODO: Optimize
        function actualizeRoomStoragePool(room) {
            if (room.memory.creeps.length > 0) {
                for (let i = 0; i < room.memory.creeps.length; i++) {
                    let creep = Game.getObjectById(room.memory.creeps[i]);
                    storagePoolController.check(creep);
                    if (creep.memory.reservedStorageResource) {
                        let creepReservedStorageResource = creep.memory.reservedStorageResource.id;
                        if (room.memory.storageResourcePool[creepReservedStorageResource]) {
                            room.memory.storageResourcePool[creepReservedStorageResource].amount -= Game.getObjectById(room.memory.creeps[i]).memory.reservedStorageResource.amount;
                        }
                    } else if (creep.memory.reservedStorageSpace) {
                        let creepReservedStorageSpace = creep.memory.reservedStorageSpace.id;
                        if (room.memory.storageSpacePool[creepReservedStorageSpace]) {
                            room.memory.storageSpacePool[creepReservedStorageSpace].amount -= Game.getObjectById(room.memory.creeps[i]).memory.reservedStorageSpace.amount;
                        }
                    }
                }
            }
        }
    }
};
module.exports = roomInit;