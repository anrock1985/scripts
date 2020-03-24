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
            if (enemyCreepsIds.length > 0) {
                for (let i in enemyCreepsIds) {
                    enemyCreeps.push(Game.getObjectById(enemyCreepsIds[i]));
                }
                //TODO: Учитывать что хилеров может быть несколько рядом.
                let healPower = 0;
                let healers = _.filter(enemyCreeps, function (c) {
                    return c.getActiveBodyparts(HEAL) > 0;
                });
                if (healers.length > 0) {
                    for (let h in healers) {
                        let healParts = healers[h].getActiveBodyparts(HEAL);
                        healPower += (healParts * 12);
                    }
                    //TODO: Implement Aim
                    let totalDamagePotential = 0;
                    for (let t in tower.room.memory.towerAims) {
                        totalDamagePotential += tower.room.memory.towerAims[t].damageByTarget;
                    }
                    if (healPower < totalDamagePotential) {
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

        function aim(enemyId) {
            let target = Game.getObjectById(enemyId);

            if (!tower.memory.targetRange) {
                tower.memory.targetRange = tower.pos.getRangeTo(target);
            }

            if (!tower.memory.targetPosition) {
                tower.memory.targetPosition = target.pos;
            }

            if (!tower.memory.damageByTarget || !tower.memory.targetPosition.isEqualTo(target.pos)) {
                tower.memory.targetPosition = target.pos;
                tower.memory.targetRange = tower.pos.getRangeTo(target);
                if (tower.memory.targetRange <= 5) {
                    tower.memory.damageByTarget = 600;
                } else if (tower.memory.targetRange >= 20) {
                    tower.memory.damageByTarget = 150;
                } else {
                    tower.memory.damageByTarget = 600 - ((tower.memory.targetRange - 5) * 30);
                }
            }
            if (!tower.room.memory.towerAims) {
                tower.room.memory.towerAims = {};
            }
            tower.room.memory.towerAims[towerId].damageByTarget = tower.memory.damageByTarget;

        }
    }
};

module.exports = towerController;

//TODO: Если в комнате враг - сливаем всю энергию в tower.

//TODO: Расчитать силу выстрела каждой турели.