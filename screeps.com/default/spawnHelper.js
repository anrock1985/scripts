let _ = require('lodash');

function isSpawnLocked(room) {
    if (!room.memory.spawnLocked || room.memory.spawnLocked === false) {
        return false;
    }
    if (room.memory.spawnLocked === true) {
        return room.memory.spawnLocked;
    }
}

function lockSpawn(room) {
    console.log("===== ===== WARN: " + room.name + " SPAWNERS LOCKED! ===== =====");
    if (!room.memory.spawnLocked) {
        room.memory.spawnLocked = true;
        return;
    }
    room.memory.spawnLocked = true;
}

function unlockSpawn(room) {
    console.log("===== ===== WARN: " + room.name + " SPAWNERS UNLOCKED! ===== =====");
    if (!room.memory.spawnLocked) {
        room.memory.spawnLocked = false;
        return;
    }
    room.memory.spawnLocked = false;
}

module.exports = {
    isSpawnLocked,
    lockSpawn,
    unlockSpawn
};
