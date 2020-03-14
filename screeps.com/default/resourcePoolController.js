let resourcePoolController = {
    check: function (creep) {

        if (creep.memory.reservedResource === undefined) {
            creep.memory.reservedResource = {};
        }
    },

    reserve: function (creep, id, resourceType, amount) {
        if (Game.getObjectById(id).amount >= amount) {
            creep.memory.reservedResource.id = id;
            creep.memory.reservedResource.resourceType = resourceType;
            creep.memory.reservedResource.amount = amount;
        } else {
            return -1;
        }
    },

    release: function (creep) {
        creep.memory.reservedResource = {};
    }

};
module.exports = resourcePoolController;