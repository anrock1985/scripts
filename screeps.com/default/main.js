module.exports.loop = function () {
    let debug = true;

    let _ = require('lodash');

    let populationController = require('populationController');
    let towerController = require('towerController');

    let roomInit = require('roomInit');

    for (let room in Game.rooms) {

        roomInit.init(Game.rooms[room]);

        if (Game.rooms[room].memory.myTowerIds) {
            for (let t in Game.rooms[room].memory.myTowerIds) {
                towerController.control(Game.rooms[room].memory.myTowerIds[t]);
            }
        }

        populationController.check(Game.rooms[room]);

        if (Game.rooms[room].memory.mySpawnerIds.length > 0 && Game.time % 10 === 0)
            console.log(Game.rooms[room].name
                + " Energy: " + Game.rooms[room].energyAvailable
                + "\\" + Game.rooms[room].energyCapacityAvailable
                + "\t Dropped: " + "AV:" + Game.rooms[room].memory.totalAvailableResourcePool
                + " RE:" + Game.rooms[room].memory.totalReservedResourcePool);
    }
};