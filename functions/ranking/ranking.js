const { retrieveConnection, doQuery } = require('../database/database')
const { registerPlayerFromEndpoint } = require('../database/dbFunctions/register')
const { countAsResultForPlayer, changeResultToPlayer, updateRatings } = require('./counters')
const { getMatchByID } = require('../match/matchHandler');
const { retrieveSteamId, retrieveSteamIdFromPlayers, retrieveSteamIdsAndRatingByDiscordId } = require('./searcher');

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
  let isRankedMap = checkIfMapIsRankedMap(games[0].Mapname);
  if (!isRankedMap) {
    return;
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

async function declareDiscordRanking(message, matchId, option, condition) {
  await countResultByCondition(matchId, option, condition).catch((err) => {
    console.error(err)
    message.channel.send(`Error: ${err}`);
  }).then((res) => {
    message.channel.send(`Result: ${res}`)
  })

}

async function declareEloWinner(message, matchId, option, condition) {
  await calculateEloChanges(matchId, option, condition).catch((err) => {
    console.error(err)
    message.channel.send(`Error: ${err}`);
  }).then((res) => {
    message.channel.send(`Result: Player rankings updated.`)
  })
}

// Calculate elo given 2 teams and a winner, if team1Won = true team 1 wins otherwise team2 wins
// Example of a team:
// BalancedTeam = 
// { "team1":{"players":
// [
//     {"steamId":"STEAM_0:1:17947198","elo":900},
//     {"steamId":"STEAM_0:1:224817525","elo":1001},
//     {"steamId":"STEAM_0:1:147526079","elo":1280},
//     {"steamId":"STEAM_0:1:429983338","elo":1400}
// ],
//     "teamAverageElo":1145.25}
// }
async function calculateEloChanges(matchId, option, condition) {
  let pickup = getMatchByID(matchId)
  let team1Won = '';
  if (option.toUpperCase() === "TEAM1") {
    team1Won = true
  } else {
    if (option.toUpperCase() === "TEAM2") {
      team1Won = false
    }
  }
  const team1get = JSON.parse(JSON.stringify(await retrieveSteamIdsAndRatingByDiscordId(pickup.team1)));
  const team2get = JSON.parse(JSON.stringify(await retrieveSteamIdsAndRatingByDiscordId(pickup.team2)));
  let team1 = {players: team1get};
  let team2 = {players: team2get};
  const kFactor = 32; // Elo update factor

  let totalEloTeam1 = 0;
  let totalEloTeam2 = 0;
  
  for(let elo in team1.players) {
      totalEloTeam1 += team1.players[elo].rating;
  }
  for(let elo in team2.players) {
      totalEloTeam2 += team2.players[elo].rating;
  }
  const team1AverageElo = totalEloTeam1 / (team1.length || 1);
  const team2AverageElo = totalEloTeam2 / (team2.length || 1);
  
  const team1ExpectedWinProbability = 1 / (1 + Math.pow(10, (team2AverageElo - team1AverageElo) / 400));
  const team2ExpectedWinProbability = 1 - team1ExpectedWinProbability;
  
  const updatedTeam1 = team1.players.map(player => ({ ...player }));
  const updatedTeam2 = team2.players.map(player => ({ ...player }));
  
  function getPointsWon() {
      const actualScore = team1Won ? 1 : 0;   
      const expectedScore = team1ExpectedWinProbability;
      const eloChange = kFactor * (actualScore - expectedScore);
      return Math.floor(eloChange);
  }
  
  function getPointsLost() {
      const actualScore = team1Won ? 0 : 1;
      const expectedScore = team2ExpectedWinProbability;
      const eloChange = kFactor * (actualScore - expectedScore);
      return Math.floor(eloChange);
  }

  const winnerTeam = team1Won?team1.players:team2.players;
  const loserTeam = team1Won?team2.players:team1.players;
  const pointsWon = getPointsWon();
  const pointsLost = getPointsLost();

  await updateRatings(winnerTeam, loserTeam, pointsWon, pointsLost);

  return;
}


function countResultByCondition(matchId, option, condition) {
  return new Promise(async (resolve, reject) => {
    let pickup = getMatchByID(matchId)
    let team1 = pickup[option]
    let option2 = ""
    if (option.toUpperCase() === "TEAM1") {
      option2 = "team2"
    } else {
      if (option.toUpperCase() === "TEAM2") {
        option2 = "team1"
      }
    }
    let condition2 = "";
    if (condition.toUpperCase() === "WIN") {
      condition2 = "lose";
    }
    if (condition.toUpperCase() === "TIE") {
      condition2 = "tie"
    }
    if (condition.toUpperCase() === "LOSE") {
      condition2 = "win"
    }

    let team2 = pickup[option2]
    const iterateOverteams = (team, condition) => {
      return new Promise((resolve, reject) => {
        var arrResult = []
        team.forEach(async (id, i) => {
          await retrieveSteamId('DiscordID', id)
            .then(async (result) => {
              await countAsResultForPlayer(result, condition)
                .catch((err) => {
                  arrResult.push(err);
                }).then((res) => {
                  arrResult.push(res);
                })
            })
            .catch((err) => {
              console.error(err)
              arrResult.push(err);
            })
          if (i === team.length - 1) {
            resolve(arrResult);
          }
        });
      })
    }
    let finalResult = []
    iterateOverteams(team1, condition).then((res) => {
      finalResult.push(res);
      iterateOverteams(team2, condition2).then((res2) => {
        finalResult.push(res2);
        resolve(finalResult);
      }).catch((err2) => {
        finalResult.push(err2);
        reject(finalResult);
      })
    }).catch((err) => {
      finalResult.push(err);
      reject(finalResult);
    })

  })
}


function checkIfMapIsRankedMap(map) {
  let maps = require('../match/maps/mapsData.json');
  return maps.includes(map);
}

async function sumResultToPlayerFromDiscordMessage(message, condition, id, operation) {
  await changeResultToPlayer(condition, id, operation).then((res) => {
    message.channel.send(`Player ranking updated succesfully ${condition}: ${res}`)
  }).catch((err) => {
    message.channel.send(`Error updating player ${err}`)
  });
}

async function showPlayersBySteamIdAtRanking(message) {
  await retrieveSteamIdFromPlayers().then((res) => {
    message.channel.send(`Result:\n ${JSON.stringify(res)}`);
  }).catch((err) => {
    console.error(err)
    message.channel.send(`Error: ${err}`);
  })
}
module.exports = { calculateWinners, declareDiscordRanking, sumResultToPlayerFromDiscordMessage, showPlayersBySteamIdAtRanking, declareEloWinner }