let roleWarrior = {
    assign: function (creep) {

        if (creep.memory.targetId === undefined) {
            creep.memory.targetId = [];
        }

        if (!Memory.attackTarget) {
            Memory.attackTarget = {};
        }

        let target = {};

        for (let f in Game.flags) {
            let flag = Game.flags[f];
            if (flag.name === "Attack") {
                if (creep.moveTo(flag) === 0) {
                    let look = flag.pos.look();
                    look.forEach(function (lookObject) {
                        if (lookObject.type === LOOK_STRUCTURES) {
                            target = lookObject.structure;
                        }
                    });
                    Memory.attackTarget[flag.pos.roomName] = target;
                }
            }
        }

        if (Memory.attackTarget && target) {
            creep.memory.target = target;
            let resultCode = creep.attack(target);
            if (resultCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            } else {
                if (resultCode !== 0) {
                    console.log("ERROR: Warrior attack result: " + resultCode);
                }
            }
        }
    }
};

module.exports = roleWarrior;