const { retrieveConnection } = require('../database/database')

async function showLadder(message) {
    let con = await retrieveConnection();
    const playersQuery = "SELECT p.Nickname,r.Position from players p, ranking r WHERE p.SteamID = r.SteamID ORDER BY r.Position;"
    con.query(playersQuery, (err, result) => {
        if (err) {
            console.log(err)
            return;
        }
        message.channel.send(`result: ${JSON.stringify(result)}`);
    });
    //to-do embed
}

async function calculateLadder() {
    return new Promise(async (reject, resolve) => {
        let con = await retrieveConnection();
        let rankingQuery = "SELECT * FROM ranking";
        con.query(rankingQuery, (err, res) => {
            if (err) {
                let error = `error retrieving ranking list ${err}`
                console.log(error)
                reject(error)
                return;
            }

            res.sort((a, b) => {
                // Ordenar por número de victorias (mayor a menor)
                if (a.Win > b.Win) return -1;
                if (a.Win < b.Win) return 1;

                // Ordenar por número de empates (mayor a menor)
                if (a.Tie > b.Tie) return -1;
                if (a.Tie < b.Tie) return 1;

                // Ordenar por número de derrotas (menor a mayor)
                if (a.Lose < b.Lose) return -1;
                if (a.Lose > b.Lose) return 1;
            })
            res.forEach((r, i) => {
                const getResultsQuery = `UPDATE tfc.ranking SET Position = ${i + 1} where SteamID = '${r.SteamID}';`;
                con.query(getResultsQuery, (err) => {
                    if (err) {
                        let error = `Error on update ranking position ${err}`
                        console.log(error);
                        reject(error);
                    }
                })
            })
        })
        resolve("discard");
    })
}



module.exports = { showLadder, calculateLadder }