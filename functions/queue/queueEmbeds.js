const config = require('../../config/config.json')
const {convertIDtoString, convertIDtoUserWithEmoji} = require('../generalFunctions')
const {EmbedBuilder} = require("discord.js");
const path = './functions/match/matchTemplate.json';
const fs = require('fs')

function queueEmbed(message, queue)
{
    var file = fs.readFileSync(path);
    let matchJson = JSON.parse(file);

    var players = convertIDtoUserWithEmoji(message, queue);
    var playersList = Array.isArray(players) ? players.join('\n') : players;
    playersList = playersList.replace(/, /g, '\n'); // Agrega saltos de línea después de cada coma y espacio
    //console.log(playersList);

    const queueEmbed = new EmbedBuilder()
	.setColor('#0099ff')
	.setTitle(`Queue ${queue.length}/${config.matchsize}`)
    .setDescription(`Players:\n${playersList}`)
    .setFooter({ text: `Match ID: ${matchJson.id}` });

    message.channel.send({embeds: [queueEmbed]});
    return matchJson.id;
}



module.exports = { queueEmbed }

