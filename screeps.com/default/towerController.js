let towerController = {
    control: function (towerId) {

        if (Game.getObjectById(towerId).store[RESOURCE_ENERGY] > 0) {
            if (Game.getObjectById(towerId).room.memory.enemyCreepsIds.length > 0) {
                let target = findClosestEnemyCreep(Game.getObjectById(towerId).room.memory.enemyCreepsIds);
                if (target !== -1) {
                    let resultCode = Game.getObjectById(towerId).attack(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower attack result code: " + resultCode);
                    }
                }
            }

            if (Game.getObjectById(towerId).room.memory.myWoundedCreepsIds.length > 0) {
                let target = findClosestMyWoundedCreep(Game.getObjectById(towerId).room.memory.myWoundedCreepsIds);
                if (target !== -1) {
                    let resultCode = Game.getObjectById(towerId).heal(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower heal result code: " + resultCode);
                    }
                }
            }

            if (Game.getObjectById(towerId).store[RESOURCE_ENERGY] > (Game.getObjectById(towerId).store.getCapacity(RESOURCE_ENERGY) / 1.5)) {


                let target;
                let tower = Game.getObjectById(towerId);

                let damagedStructure = {};
                if (tower.room.memory.myDamagedRamparts && !_.isEmpty(tower.room.memory.myDamagedRamparts)) {
                    console.log("T1");
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedRamparts));
                } else if (tower.room.memory.myDamagedStructuresIds.length > 0) {
                    console.log("T2");
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedStructuresIds));
                } else if (tower.room.memory.myDamagedFortifications && !_.isEmpty(tower.room.memory.myDamagedFortifications)) {
                    console.log("T3");
                    damagedStructure = findClosestIdByRange(tower, damageStepCalculator(tower.room.memory.myDamagedFortifications));
                } else {
                    console.log("T4");
                    damagedStructure = findClosestIdByRange(tower.room.memory.myDamagedStructuresIds);
                }

                if (damagedStructure && damagedStructure.id) {
                    target = damagedStructure.id;
                    console.log("T Target: " + target);
                    let resultCode = tower.repair(target);
                    if (resultCode !== 0) {
                        console.log("ERROR: Tower repair result code: " + resultCode);
                    }
                }


                // if (Game.getObjectById(towerId).room.memory.myDamagedStructuresIds.length > 0) {
                //     let target = findClosestMyDamagedStructure(Game.getObjectById(towerId).room.memory.myDamagedStructuresIds);
                //     if (target !== -1) {
                //         let resultCode = Game.getObjectById(towerId).repair(target);
                //         if (resultCode !== 0) {
                //             console.log("ERROR: Tower repair result code: " + resultCode);
                //         }
                //     }
                // }
            }
        }

        function findClosestEnemyCreep(enemyCreepsIds) {
            let enemyCreeps = [];
            if (enemyCreepsIds) {
                for (let i in enemyCreepsIds) {
                    enemyCreeps.push(Game.getObjectById(enemyCreepsIds[i]));
                }
                return Game.getObjectById(towerId).pos.findClosestByRange(enemyCreeps);
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
                return Game.getObjectById(towerId).pos.findClosestByRange(myWoundedCreeps);
            } else {
                return -1;
            }
        }

        function findClosestMyDamagedStructure(myDamagedStructuresIds) {
            let myDamagedStructures = [];
            if (myDamagedStructuresIds) {
                for (let s in myDamagedStructuresIds) {
                    myDamagedStructures.push(Game.getObjectById(myDamagedStructuresIds[s]));
                }
                return Game.getObjectById(towerId).pos.findClosestByRange(myDamagedStructures);
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
            for (let count = 0; count < 100000; count += 1000) {
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