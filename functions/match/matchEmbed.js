const {convertIDtoString} = require("../generalFunctions")

const Discord = require("discord.js");

function mapEmbed(message, emojis, maps) {
	const serverEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(`${emojis[0]} EU West\n${emojis[1]} EU Central\n${emojis[2]} Brazil`)
	.setFooter('venny, pls i need some food')
	return serverEmbed;
}

function serverEmbed(message, emojis) {
	
	const serverEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(`${emojis[0]} EU West\n${emojis[1]} EU Central\n${emojis[2]} Brazil`)
	.setFooter('venny, pls i need some food')
	return serverEmbed;
}

function teamsEmbed(message, team1, team2) {
    var team1 = convertIDtoString(message, team1);
    var team2 = convertIDtoString(message, team2);
    
    const redTeamEmbed = new Discord.MessageEmbed()
	.setColor('#d40000')
	.setTitle('Red Team')
	.setDescription(team1)
	.setFooter('venny, pls i need some food')
    message.channel.send(redTeamEmbed)

    const blueTeamEmbed = new Discord.MessageEmbed()
	.setColor('#0202ad')
	.setTitle('Blue Team')
	.setDescription(team2)
	.setFooter('venny, pls i need fill my stomach')
    message.channel.send(blueTeamEmbed)
	
}


module.exports = { teamsEmbed, serverEmbed, mapEmbed }