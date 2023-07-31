let { doQuery } = require('../database/database')


async function retrieveSteamId(column,id)
{
    return new Promise(async (resolve,reject) => {
        let query = `SELECT SteamId FROM players where ${column} = ${id}`
        await doQuery(query).then((result) => {
            if(Array.isArray(result))
            {
                if(result.length === 0)
                {
                    reject(`No players were found by DiscordId ${id}\n`)
                }else{
                    resolve(result);
                }
            }else{
                reject(`No players were found by DiscordId ${id}\n`);
            }
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    })
}

module.exports = { retrieveSteamId }