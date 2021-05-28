const config = require('../../config/config.json')
const {convertIDtoString} = require('../generalFunctions')
const Discord = require("discord.js");

function queueEmbed(message, queue)
{
    var players = convertIDtoString(message, queue);

    const queueEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(`Queue ${queue.length}/${config.matchsize}`)
    .setDescription(players)
	.setFooter('venny pls, i am hungry');

    message.channel.send(queueEmbed);
}


module.exports = { queueEmbed}
