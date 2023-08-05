const { retrieveConnection, doQuery } = require('../database/database')
const { showLadderEmbed } = require('./ladderEmbed');
const { EmbedBuilder } = require('discord.js');
const { rankingChannnelID } = require('../../config/config.json')
const { showAirshotLadder } = require('./airshot/ladder')

async function showLadder(discordClient) {
    const playersQuery = "SELECT p.Nickname,r.Position, r.Win, r.Lose, r.Tie from players p, ranking r WHERE p.SteamID = r.SteamID ORDER BY r.Position;"
    await doQuery(playersQuery).catch((err) => {
        console.log(err);
    }).then((result) => {
        let playerList = '';
        result.forEach((e,i) => {
            if (e.Position === null) {
                return;
            }
            playerList += `${e.Position.toString() || 'Unknown Position'} - ${e.Nickname || 'Unknown Player'} (${e.Win.toString()} | ${e.Lose.toString()} | ${e.Tie.toString()})\n`;
            if(i === result.length-1)
            {
                showLadderEmbed(playerList,rankingChannnelID, discordClient, new EmbedBuilder(), "Ranking TFC.latam", 'Stats: (Win|Lose|Tie)')
            }
        });
    })
}
async function getLadder(message, client, ladderName) {
    const { rankingLadders } = require('./rankingLadders');
    switch (ladderName) {
        case rankingLadders.Airshot:
            await showAirshotLadder(client)
            break;
        default:
            await showLadder(client);
            break;
    }
    message.author.send(`${ladderName} ranking ladder was updated at #ranking channel`);
}

async function calculateLadder() {
    let con = await retrieveConnection();
    let rankingQuery = "SELECT * FROM ranking";
    con.query(rankingQuery, (err, res) => {
        if (err) {
            let error = `error retrieving ranking list ${err}`
            console.log(error)
            return;
        }

        res.sort((a, b) => {
            // Ordenar por número de victorias (mayor a menor)
            if (a.Win > b.Win) return -1;
            if (a.Win < b.Win) return 1;

            // Ordenar por número de empates (mayor a menor)
            if (a.Tie > b.Tie) return -1;
            if (a.Tie < b.Tie) return 1;

            // Ordenar por número de derrotas (menor a mayor)
            if (a.Lose < b.Lose) return -1;
            if (a.Lose > b.Lose) return 1;
        })
        res.forEach((r, i) => {
            const getResultsQuery = `UPDATE tfc.ranking SET Position = ${i + 1} where SteamID = '${r.SteamID}';`;
            con.query(getResultsQuery, (err) => {
                if (err) {
                    let error = `Error on update ranking position ${err}`
                    console.log(error);
                }
            })
        })
    })
}

module.exports = { showLadder, calculateLadder, getLadder }