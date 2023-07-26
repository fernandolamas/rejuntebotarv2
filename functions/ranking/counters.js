
let { retrieveConnection, doQuery } = require('../database/database')
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

async function setManualRanking(message,steamId,condition,number)
{
    try{
        checkPossibleResults(condition);
    }catch(err)
    {
        message.channel.send(err);
        return;
    }


    let query = `UPDATE ranking SET ${condition} = ${number} WHERE SteamID = '${steamId}'`
    await doQuery(query).then((result) => {

        message.channel.send("Updated ranked for SteamId "+ JSON.stringify(result))
    })
    .catch((err) => {
        message.channel.send("Error while updating result: " + JSON.stringify(err));
    })
    return;
}

async function setManualRankingByName(message,nickname,condition,number)
{
    try{
        checkPossibleResults(condition);
    }catch(err)
    {
        message.channel.send(err);
        return;
    }

    let query = `SELECT SteamID from players where Nickname = '${nickname}' LIMIT 1`;
    await doQuery(query).then( async (result) => {
        if(!Array.isArray(result))
        {
            message.channel.send("The player was not found")
            throw "Player searched for ranking update was not found";
        }
        await setManualRanking(message, result[0].SteamID, condition, number);
    }).catch((err) => {
        message.channel.send("Error while searching for player: ", err);
    })
}

function checkPossibleResults(condition)
{
    let possibleResults = ['Win','Lose','Tie'];
    if(!possibleResults.includes(condition))
    {
        throw "Only possible results are: Win, Lose, Tie";
    }
    return;
}

module.exports = { countAsResultForPlayer, setManualRanking, setManualRankingByName}