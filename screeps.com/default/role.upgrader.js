let roleUpgrader = {
    run: function (creep) {
        let _ = require('lodash');

        let storagePoolController = require('storagePoolController');
        let creepHelper = require('creepHelper');

        creepHelper.checkWorkerState(creep);
        creepHelper.getClosestStorageForWorker(creep);

        if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id) {
            creep.memory.idle = undefined;
            if (creep.withdraw(Game.getObjectById(creep.memory.reservedStorageResource.id), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.reservedStorageResource.id));
            }
        }

        if (creep.store[RESOURCE_ENERGY] !== 0 && creep.memory.upgrading) {
            creep.memory.idle = undefined;
            if (creep.upgradeController(Game.getObjectById(creep.room.controller.id)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.room.controller.id));
            }
        }
    }
};

module.exports = roleUpgrader;

//TODO: Проверка что ресурс за которым идем в хранилище не пропал (например потрачен на спавн)
