let towerController = {
    control: function (towerId) {
        let _ = require('lodash');

        let tower = Game.getObjectById(towerId);

        if (tower.store[RESOURCE_ENERGY] > 0) {
            if (tower.room.memory.enemyCreepsIds.length > 0) {
                let target = findClosestEnemyCreep(tower.room.memory.enemyCreepsIds);
                if (target !== -1) {
                    let resultCode = tower.attack(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower attack result code: " + resultCode);
                    }
                }
            }

            if (tower.room.memory.myWoundedCreepsIds.length > 0) {
                let target = findClosestMyWoundedCreep(tower.room.memory.myWoundedCreepsIds);
                if (target !== -1) {
                    let resultCode = tower.heal(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower heal result code: " + resultCode);
                    }
                }
            }

            if (tower.store[RESOURCE_ENERGY] > (tower.store.getCapacity(RESOURCE_ENERGY) / 1.5)) {
                let target;
                let damagedStructure = {};

                if (tower.room.memory.myDamagedRamparts && tower.room.memory.myDamagedRamparts.length > 0) {
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedRamparts));
                }
                if (!damagedStructure && tower.room.memory.myDamagedStructuresIds.length > 0) {
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedStructuresIds));
                }
                if (!damagedStructure && tower.room.memory.myDamagedFortifications && tower.room.memory.myDamagedFortifications.length > 0) {
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedFortifications));
                }
                if (!damagedStructure && tower.room.memory.myDamagedStructuresIds.length > 0) {
                    damagedStructure = findClosestIdByRange(tower, tower.room.memory.myDamagedStructuresIds);
                }

                if (damagedStructure && damagedStructure.id) {
                    target = damagedStructure.id;
                    let resultCode = tower.repair(Game.getObjectById(target));
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower repair result code: " + resultCode);
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
                return tower.pos.findClosestByRange(enemyCreeps);
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

        function findClosestIdByRange(creep, ids) {
            let closest;
            let tmp;
            let idsObjects = [];
            for (let s in ids) {
                idsObjects.push(Game.getObjectById(ids[s]));
            }

            tmp = creep.pos.findClosestByRange(idsObjects);
            if (tmp === null)
                return undefined;
            else
                closest = tmp;

            return {id: closest.id};
        }

        function damageStepCalculator(structures) {
            let result = [];
            for (let count = 0; count < 10000; count += 1000) {
                for (let s in structures) {
                    if (structures[s].hits < count) {
                        result.push(structures[s].id);
                        console.log(count + ", " + result);
                        return result;
                    }
                }
            }
        }
    }
};

module.exports = towerController;