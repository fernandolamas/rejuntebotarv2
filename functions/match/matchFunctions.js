const { getQueue, deleteQueue, getDelayedPlayers, clearDelayedPlayers} = require("../queue/queueHandler");
const { matchEmbed, matchEmbedWithElo, serverEmbed, mapEmbed, matchEmbedIncomplete } = require("./matchEmbed");
const { retrieveTeamDiscordIdsBySteamIds } = require("../../functions/ranking/searcher.js");
const config = require("../../config/config.json");
const Path = require('path');
const { setMatch, getMaps, setMapBan, getAvailableServers, setServerBan, getMatchIncomplete, setMatchCancelled, getMatchByID, modifyMatch } = require("./matchHandler");
const { turnOnRconConnection } = require('../server/rcon/rconFunctions');
const { convertIDtoString, getUserFromMention } = require('../generalFunctions');
const emojisServer = ["1️⃣", "2️⃣", "3️⃣"]
const emojisMap = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
const errorTime = 45000;
const fs = require('fs');



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

function showMatch(message, server, map, balanced = false) {
    if (!hasEnoughPlayers(message)) return;
    var queue = getQueue()
    var {team1,team2} = balanced?shuffleBalanced(queue):shuffleFunction(queue);
    let id = getMatchId();
    matchEmbed(message, team1, team2, server, map, id, shuffleTeams)
    setMatch(team1, team2, server, map);
    //setMapBan(map, server);
    //setServerBan(server);
    //turnOnServerWithTimer(message,server);
    //no servers to choose, for now it will be only Brasil
    try{
        setTimeout(function() {
            conn = turnOnRconConnection("brasil") 
        },60000);
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

function showBalancedMatch(message, server, map) {
    return showMatch(message, server, map, true);
}

function replacePlayerInsideMatch(message, player1, player2)
{

    let currentPickups = getMatchIncomplete();
    if(currentPickups.length === 0)
    {
        message.channel.send("There are no pickups beign played right now");
        return;
    }
    let pickup = currentPickups.pop();
    let thePlayer = getUserFromMention(player2);
    let incomingPlayer = getUserFromMention(player1);
    if(pickup.team1.includes(thePlayer) || pickup.team2.includes(thePlayer))
    {
        if(pickup.team1.includes(thePlayer))
        {
            let i = pickup.team1.indexOf(thePlayer);
            pickup.team1[i] = incomingPlayer;
        }else{
            let i = pickup.team2.indexOf(thePlayer);
            pickup.team2[i] = incomingPlayer;
        }
        modifyMatch(pickup);
        message.channel.send(`Player ${player1} was replaced for ${player2} in the current match`)
        return;
    }else{
        message.channel.send(`${player2} is not in last match`);
        return;
    }
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

async function shuffleTeams(message, matchid, balanced = false){
    var match = getMatchByID(matchid);
    var queue = match.team1.concat(match.team2)
    var {team1,team2} = balanced?await shuffleByElo(queue):shuffleFunction(queue)
    match.team1 = team1;
    match.team2 = team2;
    message.channel.send("Shuffle teams!")
    if (balanced) {
        matchEmbedWithElo(message, team1, team2, match.server, match.map, matchid, shuffleTeams)
    } else {
        matchEmbed(message, team1, team2, match.server, match.map, matchid, shuffleTeams)
    }
    
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
    lastPickupName.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numB - numA;
      });
    let lastIDFileName = parseInt(lastPickupName[0].match(/\d+/)[0]);
    return require(Path.resolve(pickupsFolder + '/' + `match_${lastIDFileName}`))
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

function testMatchEmbed(message)
{
    let arr = ['726662949464178751','726662949464178751','726662949464178751','726662949464178751'];
    let arr2 = ['726662949464178751','726662949464178751','726662949464178751','181121093342461952'];
    matchEmbed(message,arr,arr2,'brasil','fry_baked_lg',getMatchId(),shuffleTeams)

    try{
        setTimeout(function() {conn = turnOnRconConnection("brasil") },60000);
    }catch(e){
        console.log(`The system was unable to establish rcon connection ${e}`);
    }
}


function calculateTeamElo(team){
    let resultado = 0;
    team.forEach((value, index) => {
            resultado+=value.elo;
    })
    return resultado;
} 
// Recieves a match queue (list of 8 discordId)
// example: ['238724894424234', '238472349848', '1294129421', '12492142424', '238724894424234', '238472349848', '1294129421', '12492142424']
// Returns an object containing both of the teams players corresponding to each team
// example: {[]}
async function shuffleByElo(queue) {
    const { retrieveSteamIdsAndRatingByDiscordId } = require('../../functions/ranking/searcher.js');
    let queryResult = await retrieveSteamIdsAndRatingByDiscordId(queue);
    queryResult = JSON.parse(JSON.stringify(queryResult));

    let rplayers = queryResult.map(player => ({ steamId: player.steamID, elo: player.rating }));
    rplayers = rplayers.sort((a, b) =>  b.elo - a.elo)

    let half1 = [];
    let half2 = [];

    let flag = true;
    rplayers.forEach((value) =>{
        if(flag) {
            half1.push(value);
        } else {
            half2.push(value);
        }
        flag = !flag;
    })

    // let eloDiff = Math.abs(totalElohalf1 - totalElohalf2)

    for(let i = 0;i < 4;i++) {
        let teamEloDiff = Math.abs(calculateTeamElo(half1)- calculateTeamElo(half2));

        let buffer = half1[i];
        half1[i] = half2[i];
        half2[i] = buffer;

        let newTeamEloDiff = Math.abs(calculateTeamElo(half1)- calculateTeamElo(half2));

        if(teamEloDiff < newTeamEloDiff) {
            let buffer = half1[i];
            half1[i] = half2[i];
            half2[i] = buffer;
        }

    }
    

    let players = [];
    half1.forEach(value => players.push(value));
    half2.forEach(value => players.push(value));

    const team1SteamIds = players.slice(0, 4).map(player => player.steamId);
    const team2SteamIds = players.slice(4).map(player => player.steamId);

    // Retrieve Discord IDs using the generated Steam IDs
    const getTeam1 = JSON.parse(JSON.stringify(await retrieveTeamDiscordIdsBySteamIds(team1SteamIds))).map(value => value.DiscordID);
    const getTeam2 = JSON.parse(JSON.stringify(await retrieveTeamDiscordIdsBySteamIds(team2SteamIds))).map(value => value.DiscordID);

    return {
        team1: getTeam1,
        team2: getTeam2
    };
}





module.exports = { shuffleTeams, createMatch, showMatchIncompletes, cancelMatch, reRollMaps, getLastMatch, replacePlayerInsideMatch, testMatchEmbed, showBalancedMatch}
