function hasIdleCreeps(room, role) {
    if (room.memory.idlers && room.memory.idlers[role])
        return room.memory.idlers[role].state;
    else
        return false;
}

module.exports = {
    hasIdleCreeps,
};