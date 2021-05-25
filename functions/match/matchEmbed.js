const {convertIDtoString} = require("../generalFunctions")

const Discord = require("discord.js");

function mapEmbed(message, emojis, maps) {
	const mapEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(`${emojis[0]} ${maps[0]}
	\n${emojis[1]} ${maps[1]}
	\n${emojis[2]} ${maps[2]}
	\n${emojis[3]} ${maps[3]}
	\n${emojis[4]} Re roll`)
	.setFooter('venny, pls i need some food')
	return mapEmbed;
}

function serverEmbed(message, emojis) {
	
	const serverEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(`${emojis[0]} US East\n${emojis[1]} US Central\n${emojis[2]} Brasil`)
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