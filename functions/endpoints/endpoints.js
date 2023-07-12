const { downloadFiles } = require('../logs/logsFunctions.js');
const { calculateWinners } = require('../ranking/ranking.js');
const { calculateLadder } = require('../ranking/ladder.js');
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

const winnersEndpoint = () => {
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


const registerEndpoints = (app) => {
    _app = app
    logsEndpoint();
    winnersEndpoint();
    ladderEndpoint();
}

module.exports = { registerEndpoints }  