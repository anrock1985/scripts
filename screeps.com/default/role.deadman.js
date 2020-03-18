let roleDeadman = {
    assign: function (creep) {
        let debug = true;

        if (creep.memory.role !== "deadman") {
            creep.memory.lastRole = creep.memory.role;
            creep.memory.role = "deadman";
            if (creep.memory.reservedResource && creep.memory.reservedResource.id)
                creep.memory.reservedResource = {};
            if (creep.memory.reservedStorageResource && creep.memory.reservedStorageResource.id)
                creep.memory.reservedStorageResource = {};
            if (creep.memory.reservedStorageSpace && creep.memory.reservedStorageSpace.id)
                creep.memory.reservedStorageSpace = {};
            switch (creep.memory.lastRole) {
                case "harvester":
                    Memory.harvesters--;
                    break;
                case "carry":
                    Memory.carry--;
                    break;
                case "upgrader":
                    Memory.upgraders--;
                    break;
                case "builder":
                    Memory.builders--;
                    break;
                case "repairer":
                    Memory.repairers--;
                    break;
                case "scout":
                    Memory.scouts--;
                    break;
                case "claimer":
                    Memory.claimers--;
                    break;
            }
            if (debug) {
                console.log("INFO: Creep " + creep.name + " marked as deadman now.");
            }
        }

        if (creep.memory.name === undefined) {
            creep.memory.name = creep.name;
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
            let resultCode = creep.drop(RESOURCE_ENERGY);
            if (resultCode !== 0) {
                console.log("ERROR: Deadman dropping result code = " + resultCode);
            }
        }
    }
};

module.exports = roleDeadman;