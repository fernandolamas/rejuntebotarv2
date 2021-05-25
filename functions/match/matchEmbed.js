const {convertIDtoString} = require("../generalFunctions")
const footer = "Pickup System";
const Discord = require("discord.js");

function mapEmbed(message, emojis, maps) {
	const mapEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.addField("List of maps:", `${emojis[0]} ${maps[0]}
	\n${emojis[1]} ${maps[1]}
	\n${emojis[2]} ${maps[2]}
	\n${emojis[3]} ${maps[3]}
	\n${emojis[4]} Re roll`)
	.setFooter(footer)
	return mapEmbed;
}

function serverEmbed(message, emojis) {
	
	const serverEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.addField("List of servers:",`${emojis[0]} US East\n${emojis[1]} US Central\n${emojis[2]} Brasil`)
	.setFooter(footer)
	return serverEmbed;
}

function matchEmbed(message, team1, team2, server, map) {
    var team1 = convertIDtoString(message, team1);
    var team2 = convertIDtoString(message, team2);
    
    const matchEmbed = new Discord.MessageEmbed()
	.setColor('#fca903')
	.setTitle('Pickup ready!')
	.addFields(
		{ name: '**Server**', value: server},
		{ name: '**Map**', value: map},
		{ name: '**🔴 Red Team**                 -', value: team1, inline: true },
		{ name: '**🔵 Blue Team**', value: team2, inline: true },
	)
	.setFooter(footer)
    message.channel.send(matchEmbed)

}


module.exports = { matchEmbed, serverEmbed, mapEmbed }