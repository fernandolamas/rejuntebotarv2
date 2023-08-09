const { showLadderEmbed } = require('../ladderEmbed');
const { airshotRankingChannelID } = require('../../../config/config.json')
const { doQuery, tables } = require('../../database/database')
const { EmbedBuilder } = require('discord.js');


const showAirshotLadder = async (client) => {
    const query = `SELECT p.Nickname, a.Amount from ${tables.airshotRanking} a, ${tables.players} p where a.SteamID = p.SteamID ORDER BY a.Amount desc;`;
    await doQuery(query).then((result) => {
        let playerList = '';
        result.forEach((e, i) => {
            playerList += `${e.Nickname || 'Unknown Player'} <=> ${e.Amount.toString()}\n`;
            if (i === result.length - 1) {
                showLadderEmbed(playerList, airshotRankingChannelID, client, new EmbedBuilder(), "Airshot Ranking", '= A I R S H O T =')
            }
        });
    }).catch((err) => {
        console.error(err);
    })
}


module.exports = { showAirshotLadder }