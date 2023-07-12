const { retrieveConnection } = require('../database/database')
const { registerPlayerFromEndpoint } = require('../database/dbFunctions/register')
const { countAsResultForPlayer } = require('./counters')

async function calculateWinners() {
  let con = await retrieveConnection();
  if (con) {
    // Realiza operaciones con la conexión a la base de datos
    // Ejemplo: con.query('SELECT * FROM tabla', function(err, result) { ... });
    let scoreRound = []
    let steamIdArr = []
    let nickArr = []
    const matchesResult = {
      win: "Win",
      lose: "Lose",
      tie: "Tie"
    }
    let queryRounds = `SELECT * FROM tfc.partidas WHERE Espectadores != 'Specs' AND Mapname = (SELECT Mapname FROM tfc.partidas WHERE Espectadores != 'Specs' ORDER BY Fecha DESC LIMIT 1) ORDER BY Fecha DESC LIMIT 2;`;
    const getResults = () => {
      return new Promise((resolve, reject) => {
        con.query(queryRounds, function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    }
    await getResults()
      .then((result) => {
        result.forEach((e, i) => {
          scoreRound[i] = parseInt(e.CapturasAzul)
          steamIdArr[i] = e.Equipo1_steamId.replace(/\s-\s?$/g, "").split(" - ");
          nickArr[i] = e.Equipo1.replace(/\s-\s?$/g, "").split(" - ");
        });
      })
      .catch((err) => {
        console.log(`Error retrieving data from the database at rankings ${err}`)
      })
    if (scoreRound[0] > scoreRound[1]) {
      await loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.win)
      await loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.lose)
    }
    if (scoreRound[0] < scoreRound[1]) {
      await loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.win)
      await loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.lose)
    }
    if (scoreRound[0] == scoreRound[1]) {
      await loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.tie)
      await loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.tie)
    }
  } else {
    console.log("Database is not connected.");
  }
}

async function loadPlayersResults(steamIdArr,nickArr, result)
{
  steamIdArr.forEach(async (s, i) => {
    await registerPlayerFromEndpoint(s, nickArr[i]);
    await countAsResultForPlayer(s, result);
  })
}

module.exports = { calculateWinners }