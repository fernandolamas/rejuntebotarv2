
const { getQueue, deleteQueue } = require("../queue/queueHandler");
const { matchEmbed, serverEmbed, mapEmbed, matchEmbedIncomplete } = require("./matchEmbed");
const config = require("../../config/config.json");
const { setMatch, getMaps, setMapBan, getAvailableServers, setServerBan, getMatchIncomplete, setMatchComplete } = require("./matchHandler");
const emojisServer = ["1️⃣", "2️⃣", "3️⃣"]
const emojisMap = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

function voteServer(message) {
    var servers = getAvailableServers();
    message.channel.send({ embed: serverEmbed(message, emojisServer, servers) }).then(embedMessage => {
       
        for (let index = 0; index < servers.length; index++) {
            embedMessage.react(emojisServer[index]);
        }

        var vote1 = 0, vote2 = 0, vote3 = 0;

        const filter = (reaction, user) => {
            return emojisServer.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id);
        };

        const collector = embedMessage.createReactionCollector(filter, { max: (config.matchsize / 2), time: 60000, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
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
        });

        collector.on('end', collected => {
            server = "";
            
            if (vote1 >= config.matchsize / 2) {
                server = servers[0]
            }
            if (vote2 >= config.matchsize / 2) {
                server = servers[1]
            }
            if(vote3 >= config.matchsize/2) {
                server = servers[2];
            }

            if(server === "") server = servers[Math.floor(Math.random() * servers.length)];
            embedMessage.delete();
            
            voteMap(message, server)

        });

    })
}

function voteMap(message,server) {
    var maps = getMaps(server)
    message.channel.send({ embed: mapEmbed(message, emojisMap, maps, server) }).then(embedMessage => {

        embedMessage.react(emojisMap[0]);
        embedMessage.react(emojisMap[1]);
        embedMessage.react(emojisMap[2]);
        embedMessage.react(emojisMap[3]);
        embedMessage.react(emojisMap[4]);

        var vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0;
        
        const filter = (reaction, user) => {
            return emojisMap.includes(reaction.emoji.name) && user.id !== embedMessage.author.id && getQueue().includes(user.id);
        };

        const collector = embedMessage.createReactionCollector(filter, { max: (config.matchsize / 2), time: 60000, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
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
        });

        collector.on('end', collected => {
            var map = ""
            
            if (vote1 >= config.matchsize / 2) {
                map = maps[0]
            }
            if (vote2 >= config.matchsize / 2) {
                map = maps[1]
            }
            if (vote3 >= config.matchsize / 2) {
                map = maps[2]
            }
            if (vote4 >= config.matchsize / 2) {
                map = maps[3]
            }
            if (vote5 >= config.matchsize / 2) {
                embedMessage.delete();
                voteMap(message,server)
                return;
            }

            if(map === "") map = maps[Math.floor(Math.random() * maps.length)];
            embedMessage.delete();
            showMatch(message,server,map);

        });

    })
}

function showMatch(message, server, map) {
    
    var queue = getQueue()
    const shuffledArray = queue.sort((a, b) => 0.5 - Math.random());
    var team1 = [];
    var team2 = [];
    shuffledArray.forEach(id => {
        if (team1.length < config.matchsize / 2) team1.push(id);
        else team2.push(id);
    });

    matchEmbed(message, team1, team2, server, map)
    setMatch(team1, team2, server, map);
    setMapBan(map,server);
    setServerBan(server);
    deleteQueue();
}

function createMatch(message) {
    voteServer(message)
}

function showMatchIncompletes(message){
    var incompleteMatchs = getMatchIncomplete();
    if(incompleteMatchs.length === 0) {
        message.channel.send("No game(s) in progress")
    }
    else {
        incompleteMatchs.forEach(m=> {
            matchEmbedIncomplete(message, m.team1, m.team2, m.server, m.map, m.id, m.date);
        })
    }
    
}

function cancelMatch(message, id){
    if(isNaN(id) || id === undefined){
        message.channel.send("Valid id required, !cancel <id>")
        return;
    }

    try{
        setMatchComplete(id);
        message.channel.send(`Pickup ${id} has been canceled`)
    }catch{
        message.channel.send(`There is no incomplete game with the id ${id}`)
    }
    
}

module.exports = { createMatch, showMatchIncompletes, cancelMatch }