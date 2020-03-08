let roleCarry = {
    run: function (creep) {
        let _ = require('lodash');

        let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType === RESOURCE_ENERGY
            }
        });

        let biggestDroppedEnergy = droppedEnergy.sort(function (a, b) {
            return b.amount - a.amount
        })[0];

        if (droppedEnergy.length === 0) {
            creep.memory.closestDroppedEnergyId = undefined;
        } else {
            creep.memory.closestDroppedEnergyId = biggestDroppedEnergy.id;
        }

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
            }
        });

        let storageNotFull = creep.pos.findClosestByRange(storages, {
            filter: (s) => {
                return s.store[RESOURCE_ENERGY] !== s.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        //TODO: Optimize
        let spawn = storages.filter(function (a) {
            return a.structureType === STRUCTURE_SPAWN
        });

        if (spawn[0].store[RESOURCE_ENERGY] !== spawn[0].store.getCapacity()) {
            creep.memory.closestStorageId = spawn[0].id;
        } else if (storageNotFull !== undefined && storageNotFull !== null) {
            creep.memory.closestStorageId = storageNotFull.id;
        }

        if (creep.memory.carrying === undefined) {
            creep.memory.carrying = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && !creep.memory.carrying) {
            creep.memory.carrying = true;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && creep.memory.carrying) {
            creep.memory.carrying = false
        }

        if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== 0) {
            if (creep.memory.closestStorageId !== null && creep.transfer(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
            }
        }

        if (!creep.memory.carrying && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.memory.closestDroppedEnergyId) {
                if (creep.pickup(Game.getObjectById(creep.memory.closestDroppedEnergyId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestDroppedEnergyId))
                }
            }
        }
    }
};

module.exports = roleCarry;