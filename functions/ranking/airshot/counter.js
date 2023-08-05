const { doQuery, tables } = require('../../database/database')
const { registerPlayerInAirshotsRankingTable } = require('./register');

const sumAirshotToAirshotRanking = (shooterId, victimId, distance) => {
    return new Promise( async (resolve,reject) => {
        let query = `SELECT Amount FROM ${tables.airshotRanking} where SteamID = '${shooterId}'`;
        await doQuery(query).then( async (player) => {
            if(player.length === 0)
            {
                await registerPlayerInAirshotsRankingTable(shooterId).then( async () => {
                    await sumAirshotToAirshotRanking(shooterId, victimId, distance).then((res) => {
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
                    })
                }).catch((err) => {
                    console.error(err);
                    reject(err)
                })
            }else{
                let sumValue = eval(`${player[0].Amount} + 1`)
                let updateQuery = `UPDATE ${tables.airshotRanking} SET Amount = ${sumValue} where SteamID = '${shooterId}'`;
                await doQuery(updateQuery).then(() => {
                    let msg = `Player ${shooterId} updated at airshot ranking`
                    console.log(msg)
                    resolve(msg)
                }).catch((err) => {
                    console.error(err)
                    reject(err);
                })
            }
        }).catch((err) => {
            console.error(err);
            reject(err);
        })
    })
}


module.exports = { sumAirshotToAirshotRanking }