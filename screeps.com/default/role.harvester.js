let roleHarvester = {
    run: function (creep) {
        let debug = true;

        if (creep.memory.harvesting === undefined) {
            creep.memory.harvesting = true;
        }
        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY) && creep.memory.harvesting) {
            creep.memory.harvesting = false;
            creep.memory.closestActiveSourceId = undefined;
        }
        if (creep.store[RESOURCE_ENERGY] === 0 && !creep.memory.harvesting) {
            creep.memory.harvesting = true;
        }

        let allEnergySourcesIdsInRoom = [];
        let allSafeEnergySourcesIdsInRoom = [];

        for (let source in creep.room.find(FIND_SOURCES)) {
            allEnergySourcesIdsInRoom.push(source.id);
        }

        creep.memory.closestSpawnerId = creep.pos.findClosestByRange(FIND_MY_SPAWNS).id;

        let activeSources = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (activeSources && !creep.memory.closestActiveSourceId && creep.memory.harvesting) {
            creep.memory.closestActiveSourceId = activeSources.id;
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
        if (storageNotFull !== undefined && storageNotFull !== null) {
            creep.memory.closestStorageId = storageNotFull.id;
        }

        if (creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.harvest(Game.getObjectById(creep.memory.closestActiveSourceId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestActiveSourceId));
            }
        }

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            if (Memory.carry > 1) {
                let result = creep.drop(RESOURCE_ENERGY);
                if (result !== 0) {
                    console.log("ERROR: Dropping result = " + result);
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