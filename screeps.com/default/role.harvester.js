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
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && !creep.memory.harvesting) {
            creep.memory.harvesting = true;
            storagePoolController.releaseTransfer(creep);
        }

        if (!creep.memory.closestSourceId) {
            creep.memory.closestSourceId = {};
        }

        let source = {};
        if (!creep.memory.closestSourceId.id && creep.memory.harvesting) {
            if (creep.room.memory.sourceIds.length > 0) {
                source = findClosestIdByPath(creep, creep.room.memory.sourceIds);
            }
            if (source && source.id) {
                creep.memory.closestSourceId.id = source.id;
            }
        }

        let storage;
        if (!creep.memory.reservedStorageSpace || !creep.memory.reservedStorageSpace.id && !creep.memory.harvesting && Memory.carry === 0) {
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

        if (creep.memory.harvesting && creep.memory.closestSourceId.id && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.idle = undefined;
            if (creep.harvest(Game.getObjectById(creep.memory.closestSourceId.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestSourceId.id));
            }
        }

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            creep.memory.idle = undefined;
            if (Memory.carry > 0) {
                let result = creep.drop(RESOURCE_ENERGY);
                if (result !== 0) {
                    console.log("ERROR: Harvester dropping result: " + result);
                }
            } else {
                if (/*creep.memory.reservedStorageSpace && */creep.memory.reservedStorageSpace.id) {
                    let resultCode = creep.transfer(Game.getObjectById(creep.memory.reservedStorageSpace.id), RESOURCE_ENERGY);
                    if (resultCode === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.reservedStorageSpace.id));
                    }
                    if (resultCode === 0) {
                        //Сбрасываем, на случай если хранилище не вместило весь наш store
                        creep.memory.reservedStorageSpace = {};
                    }
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
