
const { getQueue } = require("../queue/queueHandler");
const { teamsEmbed, serverEmbed, mapEmbed } = require("./matchEmbed");
const config = require("../../config/config.json");
const { setMatch } = require("./matchHandler");
const emojisServer = ["😂", "😁", "😀"]
const emojisMap = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

function voteMap(message) {
    message.channel.send({ embed: mapEmbed(message, emojis) }).then(embedMessage => {

        embedMessage.react(emojisMap[0]);
        embedMessage.react(emojisMap[1]);
        embedMessage.react(emojisMap[2]);
        embedMessage.react(emojisMap[3]);
        embedMessage.react(emojisMap[4]);

        var vote1 = 0, vote2 = 0, vote3 = 0, vote4 = 0, vote5 = 0;

        const filter = (reaction, user) => {
            return emojisMap.includes(reaction.emoji.name) && user.id !== embedMessage.author.id;
        };

        const collector = embedMessage.createReactionCollector(filter, { max: (config.matchsize / 2), time: 5000, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            switch (reaction.emoji.name) {
                case `${emojis[0]}`:
                    vote1++;
                    break;
                case `${emojis[1]}`:
                    vote2++;
                    break;
                case `${emojis[2]}`:
                    vote3++;
                    break;
                case `${emojis[3]}`:
                    vote4++;
                    break;
                case `${emojis[4]}`:
                    vote5++;
                    break;
            }
        });

        collector.on('end', collected => {
            if (vote1 >= config.matchsize / 2) {
                message.channel.send("Setup para server WEST")

                showTeams(message);
            }
            if (vote2 >= config.matchsize / 2) {
                message.channel.send("Setup para server CENTRAL")
                showTeams(message);
            }
            showTeams(message);
            message.channel.send("Setup para server BRASIL");


        });

    })
}

function showTeams(message) {
    var queue = getQueue()
    const shuffledArray = queue.sort((a, b) => 0.5 - Math.random());
    var team1 = [];
    var team2 = [];
    shuffledArray.forEach(id => {
        if (team1.length < config.matchsize / 2) team1.push(id);
        else team2.push(id);
    });
    teamsEmbed(message, team1, team2)
}

function voteServer(message) {

    message.channel.send({ embed: serverEmbed(message, emojisServer) }).then(embedMessage => {

        embedMessage.react(emojisServer[0]);
        embedMessage.react(emojisServer[1]);
        embedMessage.react(emojisServer[2]);

        var vote1 = 0, vote2 = 0, vote3 = 0;

        const filter = (reaction, user) => {
            return emojisServer.includes(reaction.emoji.name) && user.id !== embedMessage.author.id;
        };

        const collector = embedMessage.createReactionCollector(filter, { max: (config.matchsize / 2), time: 5000, errors: ['time'] });

        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            switch (reaction.emoji.name) {
                case `${emojis[0]}`:
                    vote1++;
                    break;
                case `${emojis[1]}`:
                    vote2++;
                    break;
                case `${emojis[2]}`:
                    vote3++;
                    break;
            }
        });

        collector.on('end', collected => {
            if (vote1 >= config.matchsize / 2) {
                message.channel.send("Setup para server WEST")
                showTeams(message);
            }
            if (vote2 >= config.matchsize / 2) {
                message.channel.send("Setup para server CENTRAL")
                showTeams(message);
            }
            showTeams(message);
            message.channel.send("Setup para server BRASIL");


        });

    })
}

function createMatch(message) {
    voteServer(message)


    //setMatch(team1, team2, "", "server");
}

module.exports = { createMatch }