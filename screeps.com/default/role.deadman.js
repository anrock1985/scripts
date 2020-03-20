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
                    creep.room.memory.harvesters--;
                    break;
                case "carry":
                    creep.room.memory.carrys--;
                    break;
                case "upgrader":
                    creep.room.memory.upgraders--;
                    break;
                case "builder":
                    creep.room.memory.builders--;
                    break;
                case "repairer":
                    creep.room.memory.repairers--;
                    break;
                case "scout":
                    creep.room.memory.scouts--;
                    break;
                case "claimer":
                    creep.room.memory.claimers--;
                    break;
            }
            if (debug) {
                console.log("INFO: " + creep.room.name + " Creep " + creep.name + " marked as deadman now.");
            }
        }

        if (creep.memory.name === undefined) {
            creep.memory.name = creep.name;
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
            let resultCode = creep.drop(RESOURCE_ENERGY);
            if (resultCode !== 0) {
                console.log("ERROR: " + creep.room.name + " Deadman " + creep.name + " dropping result code = " + resultCode);
            }
        }
    }
};

module.exports = roleDeadman;