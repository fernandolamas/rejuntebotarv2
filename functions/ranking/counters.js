
let { doQuery } = require('../database/database')
let { calculateLadder } = require('./ladder')
let i = 0;
async function countAsResultForPlayer(steamID, matchResult) {
    return new Promise(async (resolve, reject) => {
        const getResultsQuery = `SELECT ${matchResult} from ranking where SteamID = '${steamID}';`;
        await doQuery(getResultsQuery).then(async (result) => {
            var theResult = result[0][matchResult];
            const insertQuery = `UPDATE ranking SET ${matchResult} = ${theResult + 1} where SteamID = '${steamID}';`;
            await doQuery(insertQuery).then((res) => {
                console.log(`${matchResult} updated succesfully for steam id: ${steamID}`)
                i++
                reachedMaxPlayers()
                resolve(`${matchResult} updated succesfully for steam id: ${steamID}\n`);
            }).catch((err) => {
                let error = `Error updating ${matchResult} for player ${steamID}, error: ${err}`;
                console.error(error);
                i++;
                reachedMaxPlayers();
                reject(error);
            })
        }).catch((error) => {
            let err = `Error getting ${matchResult} for player ${steamID} error: ${error}`;
            console.error(err)
            reject(err)
        })
    })
}


function reachedMaxPlayers() {
    if (i < 8) {
        return;
    }
    calculateLadder();
    i = 0;
}

async function setManualRanking(message, steamId, condition, number) {
    try {
        checkPossibleResults(condition);
    } catch (err) {
        message.channel.send(err);
        return;
    }


    let query = `UPDATE ranking SET ${condition} = ${number} WHERE SteamID = '${steamId}'`
    await doQuery(query).then((result) => {

        message.channel.send("Updated ranked for SteamId " + JSON.stringify(result))
    })
        .catch((err) => {
            message.channel.send("Error while updating result: " + JSON.stringify(err));
        })
    return;
}

async function setManualRankingByName(message, nickname, condition, number) {
    try {
        checkPossibleResults(condition);
    } catch (err) {
        message.channel.send(err);
        return;
    }

    let query = `SELECT SteamID from players where Nickname = '${nickname}' LIMIT 1`;
    await doQuery(query).then(async (result) => {
        if (!Array.isArray(result)) {
            message.channel.send("The player was not found")
            throw "Player searched for ranking update was not found";
        }
        await setManualRanking(message, result[0].SteamID, condition, number);
    }).catch((err) => {
        message.channel.send("Error while searching for player: ", err);
    })
}

function checkPossibleResults(condition) {
    let possibleResults = ['Win', 'Lose', 'Tie'];
    if (!possibleResults.includes(condition)) {
        throw "Only possible results are: Win, Lose, Tie";
    }
    return;
}

module.exports = { countAsResultForPlayer, setManualRanking, setManualRankingByName }