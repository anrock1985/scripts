let towerController = {
    control: function (towerId) {

        if (Game.getObjectById(towerId).store[RESOURCE_ENERGY] > 10) {
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

            if (Game.getObjectById(towerId).room.memory.myDamagedStructuresIds.length > 0) {
                let target = findClosestMyDamagedStructure(Game.getObjectById(towerId).room.memory.myDamagedStructuresIds);
                if (target !== -1) {
                    let resultCode = Game.getObjectById(towerId).repair(target);
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
    }
};

module.exports = towerController;