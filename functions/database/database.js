const sqlclient = require('mysql');
const Path = require('path');

const {user, pass, db, host} = require(Path.join(__dirname + '/credentialsSQL.json'))
let con = null

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

async function retrieveConnection() {
  con = con === null ? await connectToMySQLDatabaseAsync() : con
  return con;
}


module.exports = { retrieveConnection }