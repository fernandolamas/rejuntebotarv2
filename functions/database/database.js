const sqlclient = require('mysql');
const Path = require('path');

const {user, pass, db, host} = require(Path.join(__dirname + '/credentialsSQL.json'))
let con = null

const tables = {
  matches: "partidas",
  players: "players",
  ranking: "ranking",
  airshot: "airshot",
  airshotRanking: "airshotranking"
}

function connectToMySQLDatabaseAsync()
{
    return new Promise((resolve, reject) => {
        con = sqlclient.createConnection({
          database: db,
          user: user,
          password: pass,
          host: host
        });
        con.connect(function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(con);
          }
        });
      });
}

async function doQuery(query)
{
  const con = await retrieveConnection();
  return new Promise((resolve,reject) => {
    con.query(query, (err, result) => {
      if(err)
      {
        reject(err);
      }
      if(result){
        resolve(result);
      }
    });
  })
}

async function retrieveConnection() {
  con = con === null ? await connectToMySQLDatabaseAsync() : con
  return con;
}


module.exports = { retrieveConnection, doQuery, tables }