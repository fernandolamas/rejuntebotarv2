const config = require('../../config/config.json')
const {convertIDtoString} = require('../generalFunctions')
const Discord = require("discord.js");
const path = './functions/match/matchTemplate.json';
const fs = require('fs')

function queueEmbed(message, queue)
{
    var file = fs.readFileSync(path);
    let matchJson = JSON.parse(file);

    var players = convertIDtoString(message, queue);

    const queueEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(`Queue ${queue.length}/${config.matchsize}`)
    .setDescription(players)
    .setFooter(`Next match: ${matchJson.id}`)
    message.channel.send(queueEmbed);
}


module.exports = { queueEmbed}
