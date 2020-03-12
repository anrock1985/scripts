let resourcePoolController = {
    check: function (creep) {

        if (creep.memory.reservedResource === undefined) {
            creep.memory.reservedResource = {};
        }

        function reserve(id, resourceType, amount) {

        }

        function release(id, resourceType, amount) {

        }
    }
};
module.exports = resourcePoolController;