let roleWarrior = {
    assign: function (creep) {

        if (creep.memory.targetId === undefined) {
            creep.memory.targetId = [];
        }

        if (!Memory.attackTarget) {
            Memory.attackTarget = {};
        }

        for (let f in Game.flags) {
            console.log(Game.flags[f]);
            if (Game.flags[f] === "Attack") {
                Memory.attackTarget[Game.flags[f].pos.roomName] = {
                    id: Game.time,
                    room: Game.flags[f].pos.roomName
                }
            }
        }

        let target;
        if (Memory.attackTarget && Memory.attackTarget[0].id) {
            target = Game.getObjectById(Memory.attackTarget[0].id);
            creep.memory.targetId = Memory.attackTarget[0].id;
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleWarrior;