
let { retrieveConnection } = require('../database/database') 

async function countAsResultForPlayer(steamID, matchResult) {
    let con = await retrieveConnection()
    const getResultsQuery = `SELECT ${matchResult} from ranking where SteamID = '${steamID}';`;



    con.query(getResultsQuery, (err, result) => {
        if (err) {
            console.log(`Error getting ${matchResult} for player ${steamID} error: ${err}`)
            return;
        }
        var theResult = result[0][`${matchResult}`];
        const insertQuery = `UPDATE ranking SET ${matchResult} = ${theResult + 1} where SteamID = '${steamID}';`;
        con.query(insertQuery, (err) => {
            if (err) {
                console.log(`Error updating ${matchResult} for player ${steamID}, error: ${err}`)
                return;
            }
            console.log(`${matchResult} updated succesfully for steam id: ${steamID}`)
        })
    });

}

module.exports = { countAsResultForPlayer }