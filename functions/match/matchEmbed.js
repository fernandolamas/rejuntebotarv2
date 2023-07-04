const {convertIDtoString} = require("../generalFunctions")
const {queueEmbed} = require("../queue/queueEmbeds")
const footer = "45s to vote";
const {EmbedBuilder} = require("discord.js");


function mapEmbed(message, emojis, maps) {
	var maplist = "";
	for (let index = 0; index < maps.length; index++) {
		maplist += `${emojis[index]} ${maps[index]}\n`
	}
	maplist += `${emojis[4]} Re roll maps`;
	
	const mapEmbed = new EmbedBuilder()
	.setColor('#04c779')
	.setTitle('Vote Map')
	.setDescription(`Maps:\n${maplist}`)
	.setFooter({ text: '45s to vote'})
	return mapEmbed;
}

function serverEmbed(message, emojis, servers) {
	var serverlist = "";
	for (let index = 0; index < servers.length; index++) {
		serverlist +=`${emojis[index]} ${servers[index]}\n`
	}
	const serverEmbed = new EmbedBuilder()
	.setColor('#04c779')
	.setTitle('Vote Server')
	.setDescription(`Server:\n${serverlist}`)
	.setFooter({ text: '45s to vote'})
	
	return serverEmbed;
}

function matchEmbedIncomplete(message, team1, team2, map){
    var cTeam1 = convertIDtoString(message, team1);
    var cTeam2 = convertIDtoString(message, team2);
    
	const fields = [
		{ name: '**Server**', value: "45.235.98.42:27029" || 'Unknown Server' },
		{ name: '**Map**', value: map || 'Unknown Map' },
		{ name: '**🔴 Red Team**', value: cTeam1 || 'Unknown Red Team', inline: true },
		{ name: '**🔵 Blue Team**', value: cTeam2 || 'Unknown Blue Team', inline: true }
	  ];


    const matchEmbed = new EmbedBuilder()
		.setColor('#fca903')
		.setTitle('Pickup ready!')
		.addFields(fields)
		.setDescription('https://tinyurl.com/tfclatam');
	message.channel.send({ embeds: [matchEmbed] });

}

function matchEmbed(message, team1, team2, server, map, id) {
	var cTeam1 = convertIDtoString(message, team1);
	var cTeam2 = convertIDtoString(message, team2);
  
	// Verifica los valores de los campos
	console.log('id', id);
	console.log('team1:', team1);
	console.log('team2:', team2);
	console.log('server:', server);
	console.log('map:', map);
	
	var cTeam1List = Array.isArray(cTeam1) ? cTeam1.join('\n') : cTeam1;
	cTeam1List = cTeam1List.replace(/, /g, '\n'); // Agrega saltos de línea después de cada coma y espacio
  
	var cTeam2List = Array.isArray(cTeam2) ? cTeam2.join('\n') : cTeam2;
	cTeam2List = cTeam2List.replace(/, /g, '\n'); // Agrega saltos de línea después de cada coma y espacio
  
	const fields = [
	  //{ name: '**ID**', value: id},
	  { name: '**Server**', value: "45.235.98.42:27029" || 'Unknown Server' },
	  { name: '**Map**', value: map || 'Unknown Map' },
	  { name: '**🔴 Red Team**', value: cTeam1List || 'Unknown Red Team', inline: true },
	  { name: '**🔵 Blue Team**', value: cTeam2List || 'Unknown Blue Team', inline: true }
	];
	
	const matchEmbed = new EmbedBuilder()
	  .setColor('#fca903')
	  .setTitle('Pickup ready!')
	  .addFields(fields)
	  .setDescription('https://tinyurl.com/tfclatam');
	
	message.channel.send({ embeds: [matchEmbed] });
  }
  
  
  module.exports = { matchEmbed, serverEmbed, mapEmbed, matchEmbedIncomplete };
  