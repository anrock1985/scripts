let towerController = {
    attack: function (tower) {
        let targets = tower.room.find(FIND_HOSTILE_CREEPS);
        let closestTarget;

        if (targets) {
            closestTarget = tower.pos.findClosestByRange(targets);
        }

        if (closestTarget) {
            tower.attack(closestTarget);
        }

    }
};

module.exports = towerController;