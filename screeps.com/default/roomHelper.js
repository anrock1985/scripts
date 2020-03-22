function hasIdleCreeps(room, role) {
    if (room.memory.idlers && room.memory.idlers[role]) {
        console.log("WARN: " + room.name + " has idle " + role.toUpperCase());
        return true;
    } else {
        console.log("WARN: " + room.name + " has NO idle " + role.toUpperCase());
        return false;
    }
}

module.exports = {
    hasIdleCreeps,
};