const { retrieveConnection } = require('../database/database')
const { registerPlayerFromEndpoint } = require('../database/dbFunctions/register')
const { countAsResultForPlayer } = require('./counters')

async function calculateWinners() {
  // Realiza operaciones con la conexión a la base de datos
  // Ejemplo: con.query('SELECT * FROM tabla', function(err, result) { ... });
  let queryRounds = `SELECT * FROM tfc.partidas WHERE Espectadores != 'Specs' AND Mapname = (SELECT Mapname FROM tfc.partidas WHERE Espectadores != 'Specs' ORDER BY Fecha DESC LIMIT 1) AND CHAR_LENGTH(Equipo1) > 12 AND CHAR_LENGTH(Equipo2) > 12 ORDER BY Fecha DESC LIMIT 2;`;
  await getResults(queryRounds)
    .then((result) => {
      evaluateRounds(result);
    })
    .catch((err) => {
      console.log(`Error retrieving data from the database at rankings ${err}`)
    })
}

const getResults = (query) => {
  return new Promise(async (resolve, reject) => {
    let con = await retrieveConnection();
    if (con) {
      con.query(query, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } else {
      console.log("Database is not connected.");
    }
  });
}

function evaluateRounds(games) {
  let maps = require('../match/maps/mapsData.json');
  let isRankedMap = maps.includes(games[0].Mapname);
  if(!isRankedMap)
  {
    return 
  }

  const matchesResult = {
    win: "Win",
    lose: "Lose",
    tie: "Tie"
  }
  let scoreRound = []
  let steamIdArr = []
  let nickArr = []
  steamIdArr[0] = games[0].Equipo1_steamId.replace(/\s-\s?$/g, "").split(" - ");
  nickArr[0] = games[0].Equipo1.replace(/\s-\s?$/g, "").split(" - ");
  steamIdArr[1] = games[0].Equipo2_steamId.replace(/\s-\s?$/g, "").split(" - ");
  nickArr[1] = games[0].Equipo2.replace(/\s-\s?$/g, "").split(" - ");
  games.forEach((e, i) => {
    scoreRound[i] = parseInt(e.CapturasAzul)
  });
  if (scoreRound.length < 2) {
    scoreRound[1] = 0;
  }
  if (scoreRound[0] > scoreRound[1]) {
    loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.win)
    loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.lose)
  }
  if (scoreRound[0] < scoreRound[1]) {
    loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.win)
    loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.lose)
  }
  if (scoreRound[0] == scoreRound[1]) {
    loadPlayersResults(steamIdArr[1], nickArr[1], matchesResult.tie)
    loadPlayersResults(steamIdArr[0], nickArr[0], matchesResult.tie)
  }
}

function loadPlayersResults(steamIdArr, nickArr, condition) {
  steamIdArr.forEach(async (s, i) => {
    try {
      registerPlayerFromEndpoint(s, nickArr[i], condition);
    } catch (error) {
      console.log("Error: " + error);
    }
  })
}
module.exports = { calculateWinners }