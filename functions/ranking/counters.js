
let { retrieveConnection } = require('../database/database')
let { calculateLadder } = require('./ladder') 
let i = 0;
async function countAsResultForPlayer(steamID, matchResult) {
    let con = await retrieveConnection()
    const getResultsQuery = `SELECT ${matchResult} from ranking where SteamID = '${steamID}';`;


    con.query(getResultsQuery, (err, result) => {
        if (err) {
            console.log(`Error getting ${matchResult} for player ${steamID} error: ${err}`)
        }
        if (result) {
            console.log(`result: ${JSON.stringify(result)}`)
            var theResult = result[0][matchResult];
            const insertQuery = `UPDATE ranking SET ${matchResult} = ${theResult + 1} where SteamID = '${steamID}';`;
            con.query(insertQuery, (err,result) => {
                if (err) {
                    console.log(`Error updating ${matchResult} for player ${steamID}, error: ${err}`)
                    i++
                    reachedMaxPlayers()
                    return;
                }
                if(result){
                    console.log(`${matchResult} updated succesfully for steam id: ${steamID}`)
                    i++
                    reachedMaxPlayers()
                    return;
                }
            })
        }
    });
}

function reachedMaxPlayers()
{
    if(i < 8) {
        return;
    }
    calculateLadder();
    i = 0;
}

module.exports = { countAsResultForPlayer }