let roleHarvester = {
    run: function (creep) {
        let debug = true;

        let allEnergySourcesIdsInRoom = [];
        let allSafeEnergySourcesIdsInRoom = [];

        if (creep.ticksToLive === 1) {
            creep.drop(RESOURCE_ENERGY)
        }

        for (let source in creep.room.find(FIND_SOURCES)) {
            allEnergySourcesIdsInRoom.push(source.id);
        }

        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && creep.memory.harvesting) {
            creep.memory.harvesting = false;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && !creep.memory.harvesting) {
            creep.memory.harvesting = true;
        }

        creep.memory.closestSpawnerId = creep.pos.findClosestByRange(FIND_MY_SPAWNS).id;
        creep.memory.closestActiveSourceId = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).id;

        let storages = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_CONTAINER
                    || s.structureType === STRUCTURE_SPAWN
            }
        });

        let storageNotFull = creep.pos.findClosestByRange(storages, {filter: (s) => {return s.store[RESOURCE_ENERGY] !== s.store.getCapacity(RESOURCE_ENERGY)}});
        if (storageNotFull !== undefined && storageNotFull !== null) {
            creep.memory.closestStorageId = storageNotFull.id;
        }

        if (creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.harvest(Game.getObjectById(creep.memory.closestActiveSourceId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestActiveSourceId));
            }
        }

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            if (Memory.carriers > 1) {
                creep.drop(RESOURCE_ENERGY);
                if (debug) {
                    console.log("INFO: Harvester drops energy");
                }
            } else if (creep.memory.closestStorageId !== null && creep.transfer(Game.getObjectById(creep.memory.closestStorageId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestStorageId));
            }
        }
    },

// Если при moveTo ошибка ERR_NO_PATH, меняем на несколько ходов источник энергии
// Проверку делаем перед тем как идти к источнику, чтобы не ходить зря

// Храним координаты точек доступности источника энергии, отправляем на добычу именно в эти точки, балансируем по кол-ву

// Если за время жизни не успеваем сходить туда-обратно - самоуничтожаемся
    getSafeEnergySource: function () {

    },
};

module.exports = roleHarvester;