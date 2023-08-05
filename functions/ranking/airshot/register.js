const { doQuery, tables } = require('../../database/database')

const registerPlayerInAirshotsRankingTable = async (SteamID) => {
    let query = `INSERT INTO ${tables.airshotRanking} (SteamID) VALUES ('${SteamID}');`;
    await doQuery(query).then((res) => {
        console.log(`Player registered successfully into ranking table ${res}`);
    }).catch((err) => {
        console.error(`Error while creating new player into ranking table ${err}`);
    })
} 

module.exports = {registerPlayerInAirshotsRankingTable}