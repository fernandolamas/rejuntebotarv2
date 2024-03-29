const { retrieveConnection } = require('../database')
const { countAsResultForPlayer } = require('../../ranking/counters')
const { doQuery } = require('../database');

async function registerPlayer(message, steamID, nickname, discordID, discordName) {
    if (steamID === undefined) {
        message.channel.send("SteamID needed");
        return;
    }
    if (nickname === undefined) {
        message.channel.send("Nickname needed");
        return;
    }
    if (discordID === undefined) {
        message.channel.send("DiscordID needed")
        return;
    }
    if (discordName === undefined) {
        message.channel.send("discordname needed")
        return;
    }
    const search = `SELECT * FROM players WHERE SteamID = '${steamID}';`;
    await doQuery(search).then(async (result) => {
        if (result.length > 0) {
            const updateQuery = `UPDATE players SET DiscordID = '${discordID}', DiscordName = '${discordName}' WHERE SteamID = '${steamID}';`;
            await doQuery(updateQuery).catch((err) => {
                message.channel.send(`error on update register query ${err}`)
            }).then(() => {
                message.channel.send('Player updated successfully.');
            })
        } else {
            const insertQuery = `INSERT INTO players (SteamID, Nickname, DiscordID, DiscordName) VALUES ('${steamID}', '${nickname}', '${discordID}', '${discordName}');`;
            await doQuery(insertQuery).catch((err) => {
                message.channel.send(`error during insert to database query ${err}`)
            }).then(async () => {
                message.channel.send('Player created successfully.');
                await registerPlayerOnRankingTable(steamID, nickname).then((res) => {
                    console.log(res)
                    message.channel.send(`Registering player at ranking table: ${res}`);
                }).catch((err) => {
                    console.log(err)
                    message.channel.send(`Error while trying to register into ranked ladder ${err}`)
                })
            })
        }
    }).catch((err) => {
        message.channel.send(` error on search register query ${err}`)
    })
}

async function registerPlayerFromEndpoint(steamID, nickname, condition) {
    //to-do separate queries and refactor error registering
    let con = await retrieveConnection();
    const search = `SELECT * FROM players WHERE SteamID = '${steamID}';`;
    con.query(search, (err, result) => {
        if (err) {
            console.log(`error on search register query ${err}`)
            return;
        }
        if (result.length > 0) {
            console.log(`Player already exists ${steamID}`)
        } else {
            const insertQuery = `INSERT INTO players (SteamID, Nickname, DiscordID, DiscordName) VALUES ('${steamID}', '${nickname}', '', '');`;

            // Ejecutar la consulta de inserción
            con.query(insertQuery, (error) => {
                if (error) {
                    showErrorOnConsole(`Error inserting player into players table ${error}`)
                    return;
                }
                console.log('Player created successfully.');
            })
        }
    })

    const searchPlayersTable = `SELECT SteamID FROM ranking WHERE SteamID = '${steamID}';`;
    con.query(searchPlayersTable, (err, result) => {
        if (err) {
            showErrorOnConsole(`Error registering player on ranking ${err}`)
            return;
        }
        if (result.length > 0) {
            console.log(`Player already exist on ranking table ${steamID}`)
            countAsResultForPlayer(steamID, condition);
            return;
        } else {
            const insertQuery = `INSERT INTO ranking (SteamID) VALUES ('${steamID}');`;
            con.query(insertQuery, (error, result) => {
                if (error) {
                    showErrorOnConsole(`Error at insert on ranking table ${error}`);
                    return;
                }
                if (result) {
                    console.log(`Player ${nickname} registered successfully at ranking table`);
                    countAsResultForPlayer(steamID, condition);
                    return;
                }
            })
        }

    })
}

function registerPlayerOnRankingTable(steamID, nickname) {
    return new Promise((resolve, reject) => {
        const searchPlayersTable = `SELECT SteamID FROM ranking WHERE SteamID = '${steamID}';`;
        doQuery(searchPlayersTable).then((res) => {
            if (res.length > 0) {
                let err = `Player already exist on ranking table ${steamID}`
                console.log(err)
                reject(err)
            }
            const insertQuery = `INSERT INTO ranking (SteamID) VALUES ('${steamID}');`;
            doQuery(insertQuery).then((res) => {
                let sol = `Player ${nickname} registered successfully at ranking table`;
                console.log(sol);
                resolve(sol)
            }).catch((error) => {
                let msg = `Error at insert on ranking table ${error}`
                showErrorOnConsole(msg);
                reject(msg)
            })
        }).catch((err) => {
            let errMsg = `Error registering player on ranking ${err}`;
            showErrorOnConsole(errMsg)
            reject(errMsg)
        })
    })
}


function showErrorOnConsole(error) {
    console.log(error);
}


module.exports = { registerPlayer, registerPlayerFromEndpoint }