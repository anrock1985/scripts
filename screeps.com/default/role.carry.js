let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        let creepHelper = require('creepHelper');
        let resourcePoolController = require('resourcePoolController');
        let storagePoolController = require('storagePoolController');

        let logLevel = "info";

        if (!creep.memory.idle) {
            creep.memory.idle = Game.time;
        }

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 && !creep.memory.carrying) {
            creep.memory.carrying = true;
            if (creep.memory.reservedResource) {
                resourcePoolController.release(creep);
            }
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.carrying) {
            creep.memory.carrying = false;
            storagePoolController.releaseTransfer(creep);
        }

        if (creep.memory.reservedStorageSpace && !creep.memory.reservedStorageSpace.id && creep.memory.carrying) {
            creepHelper.assignClosestStorageToTransfer(creep);
        }

        if (creep.memory.reservedStorageSpace && creep.memory.reservedStorageSpace.id) {
            creep.memory.idle = undefined;
            let resultCode = creep.transfer(Game.getObjectById(creep.memory.reservedStorageSpace.id), RESOURCE_ENERGY);
            if (resultCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageSpace.id));
            } else {
                //Сбрасываем, на случай если хранилище не вместило весь наш store
                creep.memory.reservedStorageSpace = {};
            }
        }

        if ((Game.time % 10 === 0) && !creep.memory.carrying && creep.memory.reservedResource && creep.memory.reservedResource.id) {
            let some = _.find(creep.room.memory.resourcePool, function (a) {
                return a.id === creep.memory.reservedResource.id
            });
            if (!some) {
                console.log("WARN: " + creep.room.name + " Reserved resource " + creep.memory.reservedResource.id + " disappears");
                creep.memory.reservedResource = {};
            }
        }

        if (!creep.memory.reservedResource || !creep.memory.reservedResource.id && !creep.memory.carrying) {
            for (let r in creep.room.memory.resourcePool) {
                let droppedEnergy = creep.room.memory.resourcePool[r];
                if (droppedEnergy.amount >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    resourcePoolController.reserve(creep, droppedEnergy.id,
                        droppedEnergy.resourceType,
                        creep.store.getFreeCapacity(RESOURCE_ENERGY));
                }
            }
        }

        if (creep.memory.reservedResource && creep.memory.reservedResource.id) {
            creep.memory.idle = undefined;
            if (creep.pickup(Game.getObjectById(creep.memory.reservedResource.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedResource.id))
            }
        }
    }
};

module.exports = roleCarry;

//TODO: Если от ресурса до склада - дорога, строим только грузовики.

//TODO: Подбор соринок энергии оставшихся от трупов, если они не далеко от основного пути.

//TODO: Чекать tombstone на наличие ресурсов
