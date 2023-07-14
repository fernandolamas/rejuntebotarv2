const { retrieveConnection } = require('../database')
const { countAsResultForPlayer } = require('../../ranking/counters')

async function registerPlayer(message, steamID, nickname, discordID, discordName) {
    const con = await retrieveConnection();


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
    const search = `SELECT * FROM Players WHERE SteamID = '${steamID}';`;

    con.query(search, (err, result) => {
        if (err) {
            message.channel.send(` error on search register query ${err}`)
            return;
        }
        if (result.length > 0) {
            const updateQuery = `UPDATE Players SET DiscordID = '${discordID}', DiscordName = '${discordName}' WHERE SteamID = '${steamID}';`;
            con.query(updateQuery, (err))
            {
                if (err) {
                    showErrorAtDiscord(message, `error on update register query ${err}`)
                    return;
                }
                message.channel.send('Player updated successfully.');
            }
        } else {
            const insertQuery = `INSERT INTO Players (SteamID, Nickname, DiscordID, DiscordName) VALUES ('${steamID}', '', '${discordID}', '${discordName}');`;

            // Ejecutar la consulta de inserción
            con.query(insertQuery, (error) => {
                if (error) {
                    showErrorAtDiscord(message, 'Error al insertar en la base de datos:' + error);
                    return;
                }

                message.channel.send('Player created successfully.');
            })
        }
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
            countAsResultForPlayer(steamID,condition);
            return;
        } else {
            const insertQuery = `INSERT INTO ranking (SteamID) VALUES ('${steamID}');`;
            con.query(insertQuery, (error, result) => {
                if (error) {
                    showErrorOnConsole(`Error at insert on ranking table ${error}`);
                    return;
                }
                if(result)
                {
                    console.log(`Player ${nickname} registered successfully at ranking table`);
                    countAsResultForPlayer(steamID,condition);
                    return;
                }
            })
        }
        
    })
}


function showErrorOnConsole(error) {
    console.log(error);
}
function showErrorAtDiscord(message, error) {
    message.channel.send(error)
}


module.exports = { registerPlayer, registerPlayerFromEndpoint }