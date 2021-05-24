
const { getQueue } = require("../queue/queueHandler");
const { teamsEmbed } = require("./matchEmbed");
const config = require("../../config/config.json");
const { setMatch } = require("./matchHandler");

function createMatch(message){
    var queue = getQueue()
    const shuffledArray = queue.sort((a, b) => 0.5 - Math.random());
    var team1 = [];
    var team2 = [];

    shuffledArray.forEach(id => {
        if(team1.length < config.matchsize/2) team1.push(id);
        else team2.push(id);
    });
    
    teamsEmbed(message, team1, team2)
    setMatch(team1, team2, 'any');
}

module.exports = {createMatch}