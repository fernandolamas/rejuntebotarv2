const { downloadFiles } = require('../logs/logsFunctions.js');
const { calculateWinners } = require('../ranking/ranking.js');
const { calculateLadder } = require('../ranking/ladder.js');
const { sendTeamsToTheServer } = require('../server/rcon/rconFunctions')
let _app;

const logsEndpoint = () => {
    _app.get("/api/logs", (req, res) => {
        console.log("Server listening to logs endpoint")
        try{
            downloadFiles()
        }catch(error){
            console.log(error)
        }finally{
            res.send("Logs endpoint replying to your request")
        }
    })
}

const winnersEndpoint = async () => {
    _app.get("/api/winner", (req, res) => {
        console.log("Server is listening to winners endpoint")
        try{
            calculateWinners();
        }catch(error){
            console.log(error);
        }finally{
            res.send("Winners endpoint replying to your request");
        }
    })
}

const ladderEndpoint = () => {
    _app.get("/api/ladder", (req, res) => {
        console.log("Server is listening to ladder endpoint")
        try{
            calculateLadder();
        }catch(error){
            console.log(error);
        }finally{
            res.send("Ladder endpoint replying to your request");
        }
    })
}
const teamsEndpoint = () => {
    _app.get("/api/teams", (req, res) => {
        console.log("Server is listening to teams endpoint")
        try{
            sendTeamsToTheServer();
        }catch(error){
            console.log(error);
        }finally{
            res.send("teams endpoint replying to your request");
        }
    })
}


const registerEndpoints = (app) => {
    _app = app
    logsEndpoint();
    winnersEndpoint();
    ladderEndpoint();
    teamsEndpoint();
}

module.exports = { registerEndpoints }  