let roleDeadman = {
    assign: function (creep) {
        let debug = true;

        if (creep.memory.role !== "deadman") {
            creep.memory.lastRole = creep.memory.role;
            creep.memory.role = "deadman";
            if (debug) {
                console.log("Creep " + creep.name + " marked as deadman now.");
            }
        }

        if (creep.memory.name === undefined) {
            creep.memory.name = creep.name;
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
            creep.memory.carriedEnergy = creep.store[RESOURCE_ENERGY];
            let resultCode = creep.drop(RESOURCE_ENERGY);
            if (resultCode !== 0) {
                console.log("ERROR: Dropping fail! Result code: " + resultCode);
            }
        }
    }
};

module.exports = roleDeadman;