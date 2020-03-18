let roleWarrior = {
    assign: function (creep) {
        if (Game.flags) {
            for (let f in Game.flags) {
                if (Game.flags[f] === "Attack") {
                    Memory.attackTarget[Game.flags[f].room.name] = {
                        id: Game.flags[f].id,
                        room: Game.flags[f].room.name
                    }
                }
            }
        }

        let target;
        if (Memory.attackTarget && Memory.attackTarget.id) {
            target = Game.getObjectById(Memory.attackTarget[0].id);
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleWarrior;