let roleClaimer = {
    assign: function (creep) {
        if (!creep.memory.idle)
            creep.memory.idle = Game.time;
    }
};
module.exports = roleClaimer;