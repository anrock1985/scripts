let storagePoolController = {
    check: function (creep) {
        //Получение ресурса из хранилища
        if (creep.memory.role === "builder"
            || creep.memory.role === "upgrader"
            || creep.memory.role === "repairer"
            || creep.memory.role === "claimer") {
            if (creep.memory.reservedStorageResource === undefined) {
                creep.memory.reservedStorageResource = {};
            }
        }

        //Доставка ресурса в хранилище
        if (creep.memory.role === "carry"
            || creep.memory.role === "harvester") {
            if (creep.memory.reservedStorageSpace === undefined) {
                creep.memory.reservedStorageSpace = {};
            }
        }
    },

    //Получение ресурса из хранилища
    reserveWithdraw: function (creep, id, resourceType, amount) {
        let logLevel = "debug";
        if (creep.memory.reservedStorageResource === undefined) {
            creep.memory.reservedStorageResource = {};
        }
        if (Game.getObjectById(id).store[RESOURCE_ENERGY] >= amount) {
            creep.memory.reservedStorageResource.id = id;
            creep.memory.reservedStorageResource.resourceType = resourceType;
            creep.memory.reservedStorageResource.amount = amount;
            creep.room.memory.storageResourcePool[id].amount -= amount;
            if (logLevel === "debug") {
                console.log("Creep " + creep.name
                    + " reserved " + creep.memory.reservedStorageResource.amount
                    + " energy from " + creep.memory.reservedStorageResource.id
                    + ". Remaining amount: " + creep.room.memory.storageResourcePool[id].amount);
            }
        } else {
            console.log("ERROR: Reserving storage resource fail!");
            return -1;
        }
    },

    //Доставка ресурса в хранилище
    reserveTransfer: function (creep, id, resourceType, amount) {
        let logLevel = "debug";
        if (creep.memory.reservedStorageSpace === undefined) {
            creep.memory.reservedStorageSpace = {};
        }
        if ((Game.getObjectById(id).store.getCapacity(RESOURCE_ENERGY) - Game.getObjectById(id).store[RESOURCE_ENERGY]) >= amount) {
            creep.memory.reservedStorageSpace.id = id;
            creep.memory.reservedStorageSpace.resourceType = resourceType;
            creep.memory.reservedStorageSpace.amount = amount;
            creep.room.memory.storageSpacePool[id].amount -= amount;
            if (logLevel === "debug") {
                console.log("Creep " + creep.name
                    + " reserved " + creep.memory.reservedStorageSpace.amount
                    + " space in " + creep.memory.reservedStorageSpace.id
                    + ". Remaining space: " + creep.room.memory.storageSpacePool[id].amount);
            }
        } else {
            console.log("ERROR: Reserving storage space fail!");
            return -1;
        }
    },

    //Получение ресурса из хранилища
    releaseWithdraw: function (creep) {
        let logLevel = "debug";
        creep.memory.reservedStorageResource = {};
        if (logLevel === "debug") {
            console.log("Creep " + creep.name + " released storage resource reserve")
        }
    },

    //Доставка ресурса в хранилище
    releaseTransfer: function (creep) {
        let logLevel = "debug";
        creep.memory.reservedStorageSpace = {};
        if (logLevel === "debug") {
            console.log("Creep " + creep.name + " released storage space reserve")
        }
    }
};
module.exports = storagePoolController;