let roleWarrior = {
    assign: function (creep) {

        if (creep.memory.targetId === undefined) {
            creep.memory.targetId = [];
        }

        if (!Memory.attackTarget) {
            Memory.attackTarget = {};
        }

        for (let f in Game.flags) {
            if (Game.flags[f].name === "Attack") {
                Memory.attackTarget[Game.flags[f].pos.roomName] = Game.flags[f];
            }
        }

        let target;
        if (Memory.attackTarget) {
            creep.memory.target = Game.flags["Attack"];
            if (creep.memory.target.pos.roomName !== creep.pos.roomName) {
            }
            // target = creep.pos.findClosestByPath(Memory.attackTarget[Game.flags["Attack"]]);
            // creep.memory.target = target;
            if (creep.memory.target)
            if (creep.attack(creep.memory.target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.memory.target);
            }
        }
    }
};

module.exports = roleWarrior;