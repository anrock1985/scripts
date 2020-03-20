let towerController = {
    control: function (towerId) {
        let _ = require('lodash');

        let creepHelper = require('creepHelper');

        let tower = Game.getObjectById(towerId);

        if (tower.store[RESOURCE_ENERGY] > 0) {
            if (tower.room.memory.enemyCreepsIds.length > 0) {
                let target = findClosestEnemyCreep(tower.room.memory.enemyCreepsIds);
                if (target !== -1) {
                    let resultCode = tower.attack(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: " + Game.getObjectById(towerId).room.name + " Tower attack result code: " + resultCode);
                    }
                }
            }

            if (tower.room.memory.myWoundedCreepsIds.length > 0) {
                let target = findClosestMyWoundedCreep(tower.room.memory.myWoundedCreepsIds);
                if (target !== -1) {
                    let resultCode = tower.heal(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: " + Game.getObjectById(towerId).room.name + " Tower heal result code: " + resultCode);
                    }
                }
            }

            if (tower.store[RESOURCE_ENERGY] > (tower.store.getCapacity(RESOURCE_ENERGY) / 1.5)) {
                let target;
                let damagedStructure = {};

                if (tower.room.memory.myDamagedRampartsIds && tower.room.memory.myDamagedRampartsIds.length > 0) {
                    damagedStructure = creepHelper.findClosestIdByRange(tower, creepHelper.damageStepCalculator(tower.room.memory.myDamagedRampartsIds));
                }
                if (!damagedStructure && tower.room.memory.myDamagedStructuresIds.length > 0) {
                    damagedStructure = creepHelper.findClosestIdByRange(tower, creepHelper.damageStepCalculator(tower.room.memory.myDamagedStructuresIds));
                }
                if (!damagedStructure && tower.room.memory.myDamagedFortificationsIds && tower.room.memory.myDamagedFortificationsIds.length > 0) {
                    damagedStructure = creepHelper.findClosestIdByRange(tower, creepHelper.damageStepCalculator(tower.room.memory.myDamagedFortificationsIds));
                }
                // if (!damagedStructure && tower.room.memory.myDamagedStructuresIds.length > 0) {
                //     damagedStructure = creepHelper.findClosestIdByRange(tower, tower.room.memory.myDamagedStructuresIds);
                // }

                if (damagedStructure && damagedStructure.id) {
                    target = damagedStructure.id;
                    let resultCode = tower.repair(Game.getObjectById(target));
                    if (resultCode !== 0) {
                        console.log("ERROR: " + Game.getObjectById(towerId).room.name + " Tower repair result code: " + resultCode);
                    }
                }
            }
        }

        function findClosestEnemyCreep(enemyCreepsIds) {
            let enemyCreeps = [];
            if (enemyCreepsIds) {
                for (let i in enemyCreepsIds) {
                    enemyCreeps.push(Game.getObjectById(enemyCreepsIds[i]));
                }
                //TODO: Расчитать силу хила, чтобы понять есть ли смысл стрелять.
                let healPower = 0;
                let healers = _.filter(enemyCreeps, function (c) {
                    return c.getActiveBodyparts(HEAL) > 0;
                });
                if (healers.length > 0) {
                    for (let h in healers) {
                        let healParts = healers[h].getActiveBodyparts(HEAL);
                        healPower += (healParts * 12);
                    }
                    if (healPower < (150 * Game.getObjectById(towerId).memory.myTowerIds.length)) {
                        return tower.pos.findClosestByRange(healers);
                    }
                } else {
                    return tower.pos.findClosestByRange(enemyCreeps);
                }
            } else {
                return -1;
            }
        }

        function findClosestMyWoundedCreep(myWoundedCreepsIds) {
            let myWoundedCreeps = [];
            if (myWoundedCreepsIds) {
                for (let c in myWoundedCreepsIds) {
                    myWoundedCreeps.push(Game.getObjectById(myWoundedCreepsIds[c]));
                }
                return tower.pos.findClosestByRange(myWoundedCreeps);
            } else {
                return -1;
            }
        }
    }
};

module.exports = towerController;

//TODO: Если в комнате враг - сливаем всю энергию в tower