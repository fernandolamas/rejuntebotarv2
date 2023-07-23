const { getQueue, deleteQueue, getDelayedPlayers, clearDelayedPlayers} = require("../queue/queueHandler");
const { MessageEmbed } = require("discord.js");
const { matchEmbed, serverEmbed, mapEmbed, matchEmbedIncomplete } = require("./matchEmbed");
const config = require("../../config/config.json");
const Path = require('path');
const { setMatch, getMaps, setMapBan, getAvailableServers, setServerBan, getMatchIncomplete, setMatchCancelled, getMatchByID, modifyMatch } = require("./matchHandler");
const { turnOnServerWithTimer } = require('../server/serverFunctions');
const { turnOnRconConnection } = require('../server/rcon/rconFunctions');
const { convertIDtoString } = require('../generalFunctions');
const emojisServer = ["1️⃣", "2️⃣", "3️⃣"]
const emojisMap = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const errorTime = 45000;
const minvote = (config.matchsize/2)+1;
const fs = require('fs');

//server rcon connection
let conn = require('../server/rcon/rconFunctions');


function hasEnoughPlayers(message) {
    if (getQueue().length < config.matchsize) {
        message.channel.send("Not enough players needed, canceling the vote");
        return false;
    }
    return true;
}

function voteServer(message) {
    if (!hasEnoughPlayers(message)) return;    
    var servers = getAvailableServers();
    message.channel.send({ embeds: [serverEmbed(message, emojisServer, servers)] }).then(embedMessage => {

        for (let index = 0; index < servers.length; index++) {
            embedMessage.react(emojisServer[index]);
        }
    
        var votes = [0, 0, 0];
        let usersStored = [];
    
        const filter = (reaction, user) => {
            return emojisServer.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id) && !usersStored.includes(user.id);
        };
    
        const collector = embedMessage.createReactionCollector({ filter, max: config.matchsize, time: errorTime, errors: ['time'] });
    
        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case `${emojisServer[0]}`:
                    votes[0]++;
                    break;
                case `${emojisServer[1]}`:
                    votes[1]++;
                    break;
                case `${emojisServer[2]}`:
                    votes[2]++;
                    break;
            }
            usersStored.push(user.id);
        });
    
        collector.on('end', collected => {
            let i = votes.indexOf(Math.max(...votes));
    
            server = servers[i];
            console.log("server: " + server);
    
            embedMessage.delete();
            voteMap(message, server);
        });
    });
}

function voteMap(message, server, id) {
    if (!hasEnoughPlayers(message)) return;
    var maps = getMaps(server);
    message.channel.send({ embeds: [mapEmbed(message, emojisMap, maps, server)] }).then(embedMessage => {

        embedMessage.react(emojisMap[0]);
        embedMessage.react(emojisMap[1]);
        embedMessage.react(emojisMap[2]);
        embedMessage.react(emojisMap[3]);
        embedMessage.react(emojisMap[4]);
        let usersStored = [];

        var votes = [0, 0, 0, 0, 0];

        const filter = (reaction, user) => {
            return emojisMap.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id) && !usersStored.includes(user.id);
        };

        const collector = embedMessage.createReactionCollector({ filter, max: config.matchsize, time: errorTime, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case `${emojisMap[0]}`:
                    votes[0]++;
                    break;
                case `${emojisMap[1]}`:
                    votes[1]++;
                    break;
                case `${emojisMap[2]}`:
                    votes[2]++;
                    break;
                case `${emojisMap[3]}`:
                    votes[3]++;
                    break;
                case `${emojisMap[4]}`:
                    votes[4]++;
                    break;
            }
            usersStored.push(user.id);
        });

        collector.on('end', collected => {
            var map = "";

            let i = votes.indexOf(Math.max(...votes));
            if (i === 4) {
                embedMessage.delete();
                voteMap(message, server);
                return;
            } else {
                map = maps[i];
            }

            embedMessage.delete();
            showMatch(message, server, map);

        });

    });
}

function shuffleFunction(queue){
    const shuffledArray = queue.sort((a, b) => 0.5 - Math.random());
    var team1 = [];
    var team2 = [];
    shuffledArray.forEach(id => {
        if (team1.length < config.matchsize / 2) team1.push(id);
        else team2.push(id);
    });
    return {team1,team2}
}

function showMatch(message, server, map) {
    if (!hasEnoughPlayers(message)) return;
    var queue = getQueue()
    var {team1,team2} = shuffleFunction(queue)
    let id = getMatchId();
    matchEmbed(message, team1, team2, server, map, id, shuffleTeams)
    setMatch(team1, team2, server, map);
    setMapBan(map, server);
    setServerBan(server);
    //turnOnServerWithTimer(message,server);
    //no servers to choose, for now it will be only Brasil
    try{
        setTimeout(function() {conn = turnOnRconConnection(message,"brasil") },60000);
    }catch(e){
        console.log(`The system was unable to establish rcon connection ${e}`);
    }
    let delayedPlayers = getDelayedPlayers()
    if(delayedPlayers.length > 0)
    {
        delayedPlayers = convertIDtoString(null,delayedPlayers);
        let str = ""
        delayedPlayers.split(',').forEach((v) => {
            str = str === "" ? v : `${str}, ${v}` ; 
        })
        message.channel.send(`The players: ${str} will need between 5-10 minutes to play the match`)
        clearDelayedPlayers();
    }
    deleteQueue();
}

function createMatch(message) {

    //voteServer(message)
    //no servers to choose, for now it will be only Brasil
    voteMap(message, "brasil");
}

function getMatchId()
{
    let { id } = require(Path.join(__dirname, '/matchTemplate.json'));
    return id
}

function shuffleTeams(message, matchid){
    var match = getMatchByID(matchid);
    var queue = match.team1.concat(match.team2)
    var {team1,team2} = shuffleFunction(queue)
    match.team1 = team1;
    match.team2 = team2;
    message.channel.send("Shuffle teams!")
    matchEmbed(message, team1, team2, match.server, match.map, matchid, shuffleTeams)
    modifyMatch(match);
}

function showMatchIncompletes(message) {
    var incompleteMatchs = getMatchIncomplete();
    if (incompleteMatchs.length === 0) {
        message.channel.send("No game(s) in progress")
    }
    else {
        incompleteMatchs.forEach(m => {
            matchEmbedIncomplete(message, m.team1, m.team2, m.map);
        })
    }

}

function cancelMatch(message, id) {
    if (isNaN(id) || id === undefined) {
        message.channel.send("Valid id required, !cancel <id>")
        return;
    }

    try {
        setMatchCancelled(id);
        message.channel.send(`Pickup ${id} has been canceled`)
    } catch {
        message.channel.send(`There is no incomplete game with the id ${id}`)
    }

}

function getLastMatch()
{
    let pickupsFolder = Path.resolve(__dirname + '/matchlog/');
    let lastPickupName = fs.readdirSync(pickupsFolder)
    if(lastPickupName.length === 0)
    {
        throw "No pickups were played still"; 
    }
    let lastIDFileName = getMatchId();
    let lastPickup = require(Path.resolve(pickupsFolder + '/' + `match_${lastIDFileName - 1}`))
    return lastPickup
}

function reRollMaps(message){
    let server = "brasil";
    var maps = getMaps(server);
    message.channel.send({ embeds: [mapEmbed(message, emojisMap, maps)] }).then(embedMessage => {

        embedMessage.react(emojisMap[0]);
        embedMessage.react(emojisMap[1]);
        embedMessage.react(emojisMap[2]);
        embedMessage.react(emojisMap[3]);
        embedMessage.react(emojisMap[4]);
        let usersStored = [];

        var votes = [0, 0, 0, 0, 0];

        const filter = (reaction, user) => {
            return emojisMap.includes(reaction.emoji.name) && user.id !== embedMessage.author.id  && !usersStored.includes(user.id);
        };

        const collector = embedMessage.createReactionCollector({ filter, max: config.matchsize, time: errorTime, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case `${emojisMap[0]}`:
                    votes[0]++;
                    break;
                case `${emojisMap[1]}`:
                    votes[1]++;
                    break;
                case `${emojisMap[2]}`:
                    votes[2]++;
                    break;
                case `${emojisMap[3]}`:
                    votes[3]++;
                    break;
                case `${emojisMap[4]}`:
                    votes[4]++;
                    break;
            }
            usersStored.push(user.id);
        });

        collector.on('end', collected => {
            var map = "";

            let i = votes.indexOf(Math.max(...votes));
            if (i === 4) {
                embedMessage.delete();
                reRollMaps(message, server);
                return;
            } else {
                map = maps[i];
                embedMessage.delete();
            }
            message.channel.send(`The map ${map} has won during re-roll`);
        });

    });
}

module.exports = { shuffleTeams , createMatch, showMatchIncompletes, cancelMatch, reRollMaps, getLastMatch }
