let resourcePoolController = {
    check: function (creep) {
        if (creep.memory.role === "carry") {
            if (creep.memory.reservedResource === undefined) {
                creep.memory.reservedResource = {};
            }
        }
    },

    reserve: function (creep, id, resourceType, amount) {
        let logLevel = "info";
        if (creep.memory.reservedResource === undefined) {
            creep.memory.reservedResource = {};
        }
        if (Game.getObjectById(id).amount >= amount || Game.getObjectById(id).store[RESOURCE_ENERGY] >= amount) {
            creep.memory.reservedResource.id = id;
            creep.memory.reservedResource.resourceType = resourceType;
            creep.memory.reservedResource.amount = amount;
            creep.room.memory.resourcePool[id].amount -= amount;
            if (logLevel === "debug") {
                console.log(creep.room.name + " Creep " + creep.name
                    + " reserved " + creep.memory.reservedResource.amount
                    + " energy from " + creep.memory.reservedResource.id
                    + ". Remaining amount: " + creep.room.memory.resourcePool[id].amount);
            }
        } else {
            console.log("ERROR: " + creep.room.name + " Reserving resource fail!");
            return -1;
        }
    },

    release: function (creep) {
        let logLevel = "info";
        creep.memory.reservedResource = {};
        if (logLevel === "debug") {
            console.log(creep.room.name + " Creep " + creep.name + " released reserve")
        }
    }

};
module.exports = resourcePoolController;