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

        //TODO: Определить безопасные источники.
        // let allEnergySourcesIdsInRoom = [];
        // let allSafeEnergySourcesIdsInRoom = [];
        // for (let source in creep.room.find(FIND_SOURCES)) {
        //     allEnergySourcesIdsInRoom.push(source.id);
        // }

        let closestSpawner = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (closestSpawner) {
            creep.memory.closestSpawnerId = closestSpawner.id;
        }

        let activeSources = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (activeSources && !creep.memory.closestActiveSourceId && creep.memory.harvesting) {
            creep.memory.closestActiveSourceId = activeSources.id;
        }

        let storagesNotFull = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType === STRUCTURE_EXTENSION
                    || s.structureType === STRUCTURE_SPAWN) && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            }
        });

        let closestStorageNotFull = {};
        if (storagesNotFull) {
            closestStorageNotFull = creep.pos.findClosestByPath(storagesNotFull);
        }
        if (closestStorageNotFull) {
            creep.memory.closestStorageNotFullId = closestStorageNotFull.id;
        } else {
            creep.memory.closestStorageNotFullId = undefined;
        }

        if (creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity(RESOURCE_ENERGY)) {
            if (creep.harvest(Game.getObjectById(creep.memory.closestActiveSourceId)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closestActiveSourceId));
            }
        }

        if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] !== 0) {
            if (Memory.carry > 0) {
                let result = creep.drop(RESOURCE_ENERGY);
                if (result !== 0) {
                    console.log("ERROR: Harvester dropping result = " + result);
                }
            } else {
                if (creep.memory.closestStorageNotFullId !== undefined && creep.transfer(Game.getObjectById(creep.memory.closestStorageNotFullId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.closestStorageNotFullId));
                }
            }
        }

        function getSafeEnergySource() {
        }
    }
};

module.exports = roleHarvester;


//TODO: Если при moveTo ошибка ERR_NO_PATH, меняем на несколько ходов источник энергии
// Проверку делаем перед тем как идти к источнику, чтобы не ходить зря.

//TODO: Храним координаты точек доступности источника энергии, отправляем на добычу именно в эти точки, балансируем по кол-ву.
// Если за время жизни не успеваем сходить туда-обратно - самоуничтожаемся.

//TODO: Кол-во харвестеров = кол-ву источников.
// Резервируем спот у источника, чтобы другие не ходили туда.