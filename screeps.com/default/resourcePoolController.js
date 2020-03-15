let resourcePoolController = {
    check: function (creep) {
        if (creep.memory.role === "carry"
            && creep.memory.reservedResource === undefined) {
            creep.memory.reservedResource = {};
        }
    },

    reserve: function (creep, id, resourceType, amount) {
        let logLevel = "info";
        if (creep.memory.reservedResource === undefined) {
            creep.memory.reservedResource = {};
        }
        if (Game.getObjectById(id).amount >= amount) {
            creep.memory.reservedResource.id = id;
            creep.memory.reservedResource.resourceType = resourceType;
            creep.memory.reservedResource.amount = amount;
            creep.room.memory.resourcePool[id].amount -= amount;
            if (logLevel === "debug") {
                console.log("Creep " + creep.name
                    + " reserved " + creep.memory.reservedResource.amount
                    + " energy from " + creep.memory.reservedResource.id
                    + ". Remaining amount: " + creep.room.memory.resourcePool[id].amount);
            }
        } else {
            console.log("ERROR: Reserving resource fail!");
            return -1;
        }
    },

    release: function (creep) {
        let logLevel = "info";
        creep.memory.reservedResource = {};
        if (logLevel === "debug") {
            console.log("Creep " + creep.name + " released reserve")
        }
    }

};
module.exports = resourcePoolController;