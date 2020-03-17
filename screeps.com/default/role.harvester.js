let roleHarvester = {
    run: function (creep) {
        let _ = require('lodash');

        let storagePoolController = require('storagePoolController');

        let debug = true;

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = true;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && creep.memory.harvesting) {
            creep.memory.harvesting = false;
            creep.memory.closestActiveSourceId = undefined;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && !creep.memory.harvesting) {
            creep.memory.harvesting = true;
        }

        if (!creep.memory.closestSourceId) {
            creep.memory.closestSourceId = {};
        }

        if (!creep.memory.closestSourceId.id && creep.memory.harvesting) {
            let source = {};
            if (creep.room.memory.sourceIds.length > 0) {
                source = findClosestIdByPath(creep, creep.room.memory.sourceIds);
            }
            if (source.id) {
                creep.memory.closestSourceId.id = source.id;
            }
        }
        // room.memory.sourceIds

        if (!creep.memory.reservedStorageSpace || !creep.memory.reservedStorageSpace.id && !creep.memory.harvesting && Memory.carry === 0) {
            let storage;
            let reservedAmount = creep.store[RESOURCE_ENERGY];

            let spawnerNotFull = [];
            let extensionNotFull = [];
            let towerNotHalfFull = [];
            let storageNotFull = [];

            towerNotHalfFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                return a.storageType === STRUCTURE_TOWER
                    && (creep.room.energyAvailable === creep.room.energyCapacityAvailable ? a.amount > 0 : a.amount >= 500)
            });

            if (towerNotHalfFull.length === 0) {
                extensionNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return a.storageType === STRUCTURE_EXTENSION
                        && a.amount > 0
                });
            }

            if (extensionNotFull.length === 0) {
                spawnerNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return a.storageType === STRUCTURE_SPAWN
                        && a.amount > 0
                });
            }

            if (spawnerNotFull.length === 0) {
                storageNotFull = _.filter(creep.room.memory.storageSpacePool, function (a) {
                    return (a.storageType !== STRUCTURE_SPAWN
                        && a.storageType !== STRUCTURE_EXTENSION
                        && a.storageType !== STRUCTURE_TOWER)
                        && a.amount > 0
                });
            }

            if (towerNotHalfFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, towerNotHalfFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else if (extensionNotFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, extensionNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else if (spawnerNotFull.length > 0) {
                storage = findClosestStorageSpaceByPath(creep, spawnerNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            } else {
                storage = findClosestStorageSpaceByPath(creep, storageNotFull);
                if (storage) {
                    if (storage.amount >= reservedAmount) {
                        storagePoolController.reserveTransfer(creep, storage.id, reservedAmount);
                    } else {
                        storagePoolController.reserveTransfer(creep, storage.id, storage.amount);
                    }
                }
            }
        }

        //
        //
        //
        let closestSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (closestSpawner) {
            creep.memory.closestSpawnerId = closestSpawner.id;
        }

        let activeSources = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (activeSources && !creep.memory.closestActiveSourceId && creep.memory.harvesting) {
            creep.memory.closestActiveSourceId = activeSources.id;
        }

        let storagesNotFull = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_SPAWN) && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        let closestStorageNotFull = {};
        if (storagesNotFull !== null) {
            closestStorageNotFull = creep.pos.findClosestByPath(storagesNotFull);
        }
        if (closestStorageNotFull) {
            creep.memory.closestStorageNotFullId = closestStorageNotFull.id;
        } else {
            creep.memory.closestStorageNotFullId = undefined;
        }

        if (creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.idle = undefined;
            if (creep.harvest(Game.getObjectById(creep.memory.closestActiveSourceId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestActiveSourceId));
            }
        }
        //
        //
        //

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            creep.memory.idle = undefined;
            if (Memory.carry > 0) {
                let result = creep.drop(RESOURCE_ENERGY);
                if (result !== 0) {
                    console.log("ERROR: Harvester dropping result = " + result);
                }
            } else {
                if (creep.memory.closestStorageNotFullId !== undefined && creep.transfer(Game.getObjectById(creep.memory.closestStorageNotFullId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageNotFullId));
                }
            }
        }

        function findClosestStorageSpaceByPath(creep, storagesIds) {
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

            return {id: closest.id, amount: closest.store.getFreeCapacity(RESOURCE_ENERGY)};
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

module.exports = roleHarvester;


//TODO: Если при moveTo ошибка ERR_NO_PATH, меняем на несколько ходов источник энергии
// Проверку делаем перед тем как идти к источнику, чтобы не ходить зря.

//TODO: Храним координаты точек доступности источника энергии, отправляем на добычу именно в эти точки, балансируем по кол-ву.
// Если за время жизни не успеваем сходить туда-обратно - самоуничтожаемся.

//TODO: Кол-во харвестеров = кол-ву источников.
// Резервируем спот у источника, чтобы другие не ходили туда.

//TODO: Определить безопасные источники.
