function hasIdleCreeps(room, role) {
    return room.memory.idlers && room.memory.idlers[role];
}

module.exports = {
    hasIdleCreeps,
};