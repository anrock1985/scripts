let roleClaimer = {
    assign: function (creep) {
        if (!creep.memory.idle)
            creep.memory.idle = Game.time;

        if (!creep.memory.working) {
            creep.memory.working = true;
        }


    }
};
module.exports = roleClaimer;