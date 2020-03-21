let sourcePoolController = {
    check: function (creep) {
        if (creep.memory.role === "harvester") {
            if (!creep.memory.reservedSource) {
                creep.memory.reservedSource = {};
            }
        }
    },

    reserve: function (creep, sourceId) {
        let logLevel = "debug";

        if (!creep.memory.reservedSource) {
            creep.memory.reservedSource = {};
        }
        creep.memory.reservedSource.id = sourceId;
        if (logLevel === "debug") {
            console.log(creep.room.name + " Creep " + creep.name
                + " reserved " + creep.memory.reservedSource.id + " source");
        }
    },

    release: function (creep) {
        let logLevel = "debug";
        creep.memory.reservedSource = {};
        if (logLevel === "debug") {
            console.log(creep.room.name + " Creep " + creep.name + " released source reserve")
        }
    }
};
module.exports = sourcePoolController;
