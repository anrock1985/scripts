let towerController = {
    control: function (towerId) {

        function findClosestEnemyCreep(enemyCreepIds) {
            let enemyCreeps = [];
            if (enemyCreepIds) {
                for (let i in enemyCreepIds) {
                    enemyCreeps.push(Game.getObjectById(enemyCreepIds[i]));
                }
                return Game.getObjectById(towerId).pos.findClosestByRange(enemyCreeps);
            } else {
                return -1;
            }
        }

        if (Game.getObjectById(towerId).room.memory.enemyCreepsIds) {
            Game.getObjectById(towerId).attack(findClosestEnemyCreep(Game.getObjectById(towerId).room.memory.enemyCreepsIds));
        }
    }
};

module.exports = towerController;