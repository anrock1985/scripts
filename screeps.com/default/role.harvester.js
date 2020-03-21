let roleHarvester = {
    run: function (creep) {
        let _ = require('lodash');

        let creepHelper = require('creepHelper');
        let storagePoolController = require('storagePoolController');
        let sourcePoolController = require('sourcePoolController');

        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = true;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && creep.memory.harvesting) {
            creep.memory.harvesting = false;
            sourcePoolController.release(creep);
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && !creep.memory.harvesting) {
            creep.memory.harvesting = true;
            storagePoolController.releaseTransfer(creep);
        }

        if (!creep.memory.closestSourceId) {
            creep.memory.closestSourceId = {};
        }

        if (creep.memory.reservedSource && !creep.memory.reservedSource.id && creep.memory.harvesting) {
            creepHelper.assignClosestSourceToHarvest(creep);
        }

        // let source = {};
        // if (!creep.memory.closestSourceId.id && creep.memory.harvesting) {
        //     if (creep.room.memory.sourceIds.length > 0) {
        //         source = creepHelper.findClosestIdByPath(creep, creep.room.memory.sourceIds);
        //     }
        //     if (source && source.id) {
        //         creep.memory.closestSourceId.id = source.id;
        //     }
        // }
        //

        if (creep.memory.reservedStorageSpace || !creep.memory.reservedStorageSpace.id && !creep.memory.harvesting && creep.room.memory.carrys === 0) {
            creepHelper.assignClosestStorageToTransfer(creep);
        }

        //
        // if (creep.memory.harvesting && creep.memory.closestSourceId.id && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
        //     creep.memory.idle = undefined;
        //     if (creep.harvest(Game.getObjectById(creep.memory.closestSourceId.id)) === ERR_NOT_IN_RANGE) {
        //         creep.moveTo(Game.getObjectById(creep.memory.closestSourceId.id));
        //     }
        // }

        if (creep.memory.harvesting && creep.memory.reservedSource.id && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.idle = undefined;
            if (creep.harvest(Game.getObjectById(creep.memory.reservedSource.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedSource.id));
            }
        }

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            creep.memory.idle = undefined;
            if (creep.room.memory.carrys > 0) {
                let result = creep.drop(RESOURCE_ENERGY);
                if (result !== 0) {
                    console.log("ERROR: " + creep.room.name + " Harvester dropping result: " + result);
                }
            } else {
                if (creep.memory.reservedStorageSpace.id) {
                    let resultCode = creep.transfer(Game.getObjectById(creep.memory.reservedStorageSpace.id), RESOURCE_ENERGY);
                    if (resultCode === ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.reservedStorageSpace.id));
                    } else {
                        //Сбрасываем, на случай если хранилище не вместило весь наш store
                        creep.memory.reservedStorageSpace = {};
                    }
                }
            }
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
