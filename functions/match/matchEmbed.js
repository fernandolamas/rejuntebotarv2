const {convertIDtoString} = require("../generalFunctions")
const footer = "Pickup System";
const Discord = require("discord.js");

function mapEmbed(message, emojis, maps) {
	var maplist = "";
	for (let index = 0; index < maps.length; index++) {
		maplist += `${emojis[index]} ${maps[index]}\n`
	}
	maplist += `${emojis[4]} Re roll maps`;
	
	const mapEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(maplist)
	.setFooter(footer)
	return mapEmbed;
}

function serverEmbed(message, emojis, servers) {
	var serverlist = "";
	for (let index = 0; index < servers.length; index++) {
		serverlist +=`${emojis[index]} ${servers[index]}\n`
	}
	const serverEmbed = new Discord.MessageEmbed()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(serverlist)
	.setFooter(footer)
	
	return serverEmbed;
}

function matchEmbedIncomplete(message, team1, team2, server, map, id, date){
    var team1 = convertIDtoString(message, team1);
    var team2 = convertIDtoString(message, team2);
    
    const matchEmbed = new Discord.MessageEmbed()
	.setColor('#fca903')
	.setTitle('Pickup ready!')
	.addFields(
		{ name: '**ID**', value: id},
		{ name: '**Server**', value: server},
		{ name: '**Map**', value: map, inline: true },
		{ name: '**🔴 Red Team**                 -', value: team1},
		{ name: '**🔵 Blue Team**', value: team2, inline: true },
		{ name: '**Started at:**', value: new Date(date).toLocaleString()},
	)
	.setFooter(footer)
    message.channel.send(matchEmbed)

}

function matchEmbed(message, team1, team2, server, map) {
    var team1 = convertIDtoString(message, team1);
    var team2 = convertIDtoString(message, team2);

	const currentServer = { 
		brasil: {
			name: 'Brasil',
			ip: '34.95.232.99:27015'
		},
		uscentral: {
			name: 'US Central',
			ip: '34.136.53.33:27015'
		},
		useast: {
			name: 'US East',
			ip: '34.86.237.46:27015'
		}
	}
    
    const matchEmbed = new Discord.MessageEmbed()
	.setColor('#fca903')
	.setTitle('Pickup ready!')
	.addFields(
		{ name: '**Server**', value: server},
		{ name: '**Map**', value: map},
		{ name: '**🔴 Red Team**                 -', value: team1, inline: true },
		{ name: '**🔵 Blue Team**', value: team2, inline: true },
	)
	// steam://connect/34.95.232.99:27015/rjt `steam://connect/${currentServer[server]['ip']}/rjt`
	.setDescription(`${currentServer[server]['name']} Server Connect Here -> steam://connect/${currentServer[server]['ip']}/rjt`)
    message.channel.send(matchEmbed)

}


module.exports = { matchEmbed, serverEmbed, mapEmbed, matchEmbedIncomplete }