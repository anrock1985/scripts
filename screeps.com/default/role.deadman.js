let roleDeadman = {
    assign: function (creep) {
        if (creep.ticksToLive === 1) {
            creep.memory.name = creep.name;
            creep.memory.carriedEnergy = creep.store[RESOURCE_ENERGY];
            creep.drop(RESOURCE_ENERGY);
            if (debug) {
                console.log("WARN: Creep will die next tick. Dropping resources. Check: " + creep.store[RESOURCE_ENERGY]);
            }
        }
    }
};

module.exports = roleDeadman;