let { doQuery } = require('../database/database');


async function retrieveSteamId(column, id) {
    return new Promise(async (resolve, reject) => {
        let query = `SELECT SteamId FROM players where ${column} = ${id}`
        await doQuery(query).then((result) => {
            if (Array.isArray(result)) {
                if (result.length === 0) {
                    reject(`No players were found by ${column} ${id}\n`)
                } else {
                    resolve(result[0].SteamId);
                }
            } else {
                reject(`No players were found by ${column} ${id}\n`);
            }
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    })
}

async function retrieveLastSteamIdFromMatches() {
    return new Promise(async (resolve, reject) => {
        const {getLastMatch} = require('../match/matchFunctions.js');
        let lastPickup = getLastMatch();
        let team1 = lastPickup.team1;
        let team2 = lastPickup.team2;
        let ids = [[], []];

        const retrieveSteamIdFunc = (team, ids, i) => {
            return new Promise((resolve, reject) => {
                team.forEach(async (id) => {
                    await retrieveSteamId('DiscordID', id).then((steamId) => {
                        ids[i].push(steamId)
                    }).catch(console.error);
                });
                setTimeout(() => {
                    resolve(ids);
                }, 1000);
            })
        }
        await retrieveSteamIdFunc(team1, ids, 0).then(async (res) => {
            await retrieveSteamIdFunc(team2, res, 1).then((r2res) => {
                resolve(r2res);
            }).catch((err) => {
                reject(err);
            });
        });
    })
}

async function retrieveLastSteamIdFromMatchesToDiscord(message) {
    await retrieveLastSteamIdFromMatches().then((lastSteamId) => {
        let firstSteamString = lastSteamId[0].join("\n");
        let secondTeamString = lastSteamId[1].join("\n");
        message.channel.send(`Retriving teams from last pickup... \nTeam1:\n ${firstSteamString}\n Team2:\n ${secondTeamString}`)
    }).catch(console.error)
}

function retrieveSteamIdFromPlayers()
{
    return new Promise(async (resolve,reject) => {
        let query = `SELECT Nickname, SteamID from players;`;
        await doQuery(query).then((res) => {
            resolve(res);
        }).catch((err) => {
            console.error(err);
            reject(err);
        })
    })
}

function retrievePlayerNicknameBySteamId(steamId)
{
    return new Promise(async (resolve,reject) => {
        let query = `SELECT Nickname from players where SteamID = '${steamId}';`
        await doQuery(query).then((res) => {
            resolve(res[0].Nickname)
        }).catch((err) => {
            reject(err);
        })
    })
}


/**
 * @param {Array.<string>} discordIds - Gets an array of discord ids, resolves their respective steamIds and rating
 */
function retrieveSteamIdsAndRatingByDiscordId(discordIds) {
    return new Promise(async (resolve,reject) => {
        let query = `SELECT p.steamID, r.rating FROM players p INNER JOIN ranking r ON p.steamID = r.SteamID WHERE p.DiscordID IN ('${discordIds.join("','")}')`
        await doQuery(query).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err);
        })
    })
}

/**
* @param {Array.<string>} team - Gets an array of steam ids, resolves their respective discordIds
*/
function retrieveTeamDiscordIdsBySteamIds(team) {
    return new Promise(async (resolve,reject) => {
        let query = `SELECT p.DiscordID FROM players p WHERE p.SteamID IN ('${team.join("','")}')`
        await doQuery(query).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err);
        })
    })
}

function retrieveRatingByDiscordIds(discordIds) {
    return new Promise(async (resolve,reject) => {
        let query = `SELECT p.SteamID, r.rating FROM ranking r INNER JOIN players p ON r.SteamID = p.SteamID WHERE p.DiscordID IN ('${discordIds.join("','")}')`

        await doQuery(query).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err);
        })
    })
}
module.exports = { retrieveSteamId, retrieveLastSteamIdFromMatchesToDiscord, retrieveSteamIdFromPlayers, retrievePlayerNicknameBySteamId, retrieveSteamIdsAndRatingByDiscordId, retrieveTeamDiscordIdsBySteamIds, retrieveRatingByDiscordIds}