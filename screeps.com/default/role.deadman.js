let roleDeadman = {
    assign: function (creep) {
        let debug = true;

        if (creep.memory.role !== "deadman") {
            creep.memory.role = "deadman";
            if (debug) {
                console.log("Creep " + creep.name + " marked as deadman now.");
            }
        }

        if (creep.memory.name === undefined) {
            creep.memory.name = creep.name;
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (debug) {
                console.log("[TTL:" + creep.ticksToLive + "] Deadman " + creep.name + " carrying " + creep.store[RESOURCE_ENERGY] + " energy. Dropping it.");
            }
            creep.drop(RESOURCE_ENERGY);
        }

        if (creep.ticksToLive === 1) {
            creep.memory.carriedEnergy = creep.store[RESOURCE_ENERGY];
            if (debug) {
                console.log("WARN: Deadman " + creep.memory.name + " will die next tick. Checking store: " + creep.store[RESOURCE_ENERGY]);
            }
        }
    }
};

module.exports = roleDeadman;