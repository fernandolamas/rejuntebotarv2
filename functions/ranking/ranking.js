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
      console.log("Jugadores del round1 fueron ganadores")
      await loadWinners(steamIdArr[0], nickArr[0])
      await loadLossers(steamIdArr[1], nickArr[1])
    }
    if (scoreRound[0] < scoreRound[1]) {
      console.log("Jugadores del round2 fueron ganadores")
      await loadWinners(steamIdArr[1], nickArr[1])
      await loadLossers(steamIdArr[0], nickArr[0])
    }
    if (scoreRound[0] == scoreRound[1]) {
      await loadTiers(steamIdArr[1], nickArr[1])
      await loadTiers(steamIdArr[0], nickArr[0])
    }
  } else {
    console.log("Database is not connected.");
  }
}

async function loadWinners(winners, nicks) {
  winners.forEach(async (w, i) => {
    await registerPlayerFromEndpoint(w, nicks[i]);
    await countAsResultForPlayer(w, "Win");
  });
}

async function loadLossers(lossers, nicks) {
  lossers.forEach(async (l, i) => {
    await registerPlayerFromEndpoint(l, nicks[i]);
    await countAsResultForPlayer(l, "Lose");
  });
}

async function loadTiers(tiers, nicks) {
  tiers.forEach(async (t, i) => {
    await registerPlayerFromEndpoint(t, nicks[i]);
    await countAsResultForPlayer(t, "Tie");
  })
}

module.exports = { calculateWinners }