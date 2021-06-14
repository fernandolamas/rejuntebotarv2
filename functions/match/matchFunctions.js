
const { getQueue, deleteQueue } = require("../queue/queueHandler");
const { matchEmbed, serverEmbed, mapEmbed, matchEmbedIncomplete } = require("./matchEmbed");
const config = require("../../config/config.json");
const { setMatch, getMaps, setMapBan, getAvailableServers, setServerBan, getMatchIncomplete, setMatchCancelled, getMatchByID, modifyMatch } = require("./matchHandler");
const { turnOnServerWithTimer } = require('../server/serverFunctions')
const emojisServer = ["1️⃣", "2️⃣", "3️⃣"]
const emojisMap = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const errorTime = 5000;
const minvote = (config.matchsize/2)+1;

function hasEnoughPlayers(message) {
    if (getQueue().length < config.matchsize) {
        message.channel.send("No enough of players needed, canceling the vote")
        return false;
    }
    return true;
}

function voteServer(message) {
    if (!hasEnoughPlayers(message)) return;

    var servers = getAvailableServers();
    message.channel.send({ embed: serverEmbed(message, emojisServer, servers) }).then(embedMessage => {

        for (let index = 0; index < servers.length; index++) {
            embedMessage.react(emojisServer[index]);
        }

        var vote1 = 0, vote2 = 0, vote3 = 0;
        let usersStored = [];

        const filter = (reaction, user) => {
            return emojisServer.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id) && usersStored.includes(user.id);
        };

        const collector = embedMessage.createReactionCollector(filter, { max: config.matchsize, time: errorTime, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            if(!usersStored.includes(user.id))
            {
                switch (reaction.emoji.name) {
                    case `${emojisServer[0]}`:
                        vote1++;
                        break;
                    case `${emojisServer[1]}`:
                        vote2++;
                        break;
                    case `${emojisServer[2]}`:
                        vote3++;
                        break;
                }
            }else
            {
                usersStored.push(user.id);
            }
            
            
        });

        collector.on('end', collected => {
            server = "";
            
            if (vote1 > minvote) {
                server = servers[0]
            }
            if (vote2 > minvote) {
                server = servers[1]
            }
            if (vote3 > minvote) {
                server = servers[2];
            }

            if (server === "") server = servers[Math.floor(Math.random() * servers.length)];
            embedMessage.delete();

            voteMap(message, server)

        });

    })
}

function voteMap(message, server) {
    if (!hasEnoughPlayers(message)) return;
    var maps = getMaps(server)
    message.channel.send({ embed: mapEmbed(message, emojisMap, maps, server) }).then(embedMessage => {

        embedMessage.react(emojisMap[0]);
        embedMessage.react(emojisMap[1]);
        embedMessage.react(emojisMap[2]);
        embedMessage.react(emojisMap[3]);
        embedMessage.react(emojisMap[4]);
        let usersStored = [];

        var vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0;

        const filter = (reaction, user) => {
            return emojisMap.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id)  && usersStored.includes(user.id);
        };

        const collector = embedMessage.createReactionCollector(filter, { max: config.matchsize, time: errorTime, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            if (!usersStored.includes(user.id)) {
                switch (reaction.emoji.name) {
                    case `${emojisMap[0]}`:
                        vote1++;
                        break;
                    case `${emojisMap[1]}`:
                        vote2++;
                        break;
                    case `${emojisMap[2]}`:
                        vote3++;
                        break;
                    case `${emojisMap[3]}`:
                        vote4++;
                        break;
                    case `${emojisMap[4]}`:
                        vote5++;
                        break;
                }
            }else
            {
                usersStored.push(user.id);
            }
        });

        collector.on('end', collected => {
            var map = ""
            if (vote1 > minvote) {
                map = maps[0]
            }
            if (vote2 > minvote) {
                map = maps[1]
            }
            if (vote3 > minvote) {
                map = maps[2]
            }
            if (vote4 > minvote) {
                map = maps[3]
            }
            if (vote5 > minvote) {
                embedMessage.delete();
                voteMap(message, server)
                return;
            }

            if (map === "") map = maps[Math.floor(Math.random() * maps.length)];
            embedMessage.delete();
            showMatch(message, server, map);

        });

    })
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
    matchEmbed(message, team1, team2, server, map)
    setMatch(team1, team2, server, map);
    setMapBan(map, server);
    setServerBan(server);
    turnOnServerWithTimer(message,server);
    deleteQueue();
}

function createMatch(message) {
    voteServer(message)
}

function shuffleTeams(message, matchid){
    var match = getMatchByID(matchid);
    var queue = match.team1.concat(match.team2)
    var {team1,team2} = shuffleFunction(queue)
    match.team1 = team1;
    match.team2 = team2;
    message.channel.send("Shuffle teams!")
    matchEmbed(message, team1, team2, match.server, match.map)
    modifyMatch(match);
}

function showMatchIncompletes(message) {
    var incompleteMatchs = getMatchIncomplete();
    if (incompleteMatchs.length === 0) {
        message.channel.send("No game(s) in progress")
    }
    else {
        incompleteMatchs.forEach(m => {
            matchEmbedIncomplete(message, m.team1, m.team2, m.server, m.map, m.id, m.date);
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

module.exports = { shuffleTeams,createMatch, showMatchIncompletes, cancelMatch }