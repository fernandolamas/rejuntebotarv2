const { downloadFiles } = require('../logs/logsFunctions.js');
const { calculateWinners } = require('../ranking/ranking.js');
const { calculateLadder } = require('../ranking/ladder.js');
const { sendTeamsToTheServer } = require('../server/rcon/rconFunctions')
const { sumAirshotToAirshotRanking } = require('../ranking/airshot/counter')
let _app;

const logsEndpoint = (discordClient) => {
    _app.get("/api/logs", (req, res) => {
        console.log("Server listening to logs endpoint")
        try{
            downloadFiles(discordClient)
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
const teamsEndpoint = (discordClient) => {
    _app.get("/api/teams", (req, res) => {
        console.log("Server is listening to teams endpoint")
        try{
            sendTeamsToTheServer(discordClient);
        }catch(error){
            console.log(error);
        }finally{
            res.send("teams endpoint replying to your request");
        }
    })
}
const testEndpoint = () => {
    _app.get("/api/test", async (req,res) => {
        try{
            let { retrieveConnection } = require('../discord/discord.js');
            let client = await retrieveConnection();
            //718271966800248844 testing channel
          //1113175589583585371
          //1132076066232602685 test2channel
          const channel = await client.channels.fetch('1132076066232602685');
          channel.send("test")
        }catch(err)
        {
            console.error(err);
        }
    })
}

const airEndpoint = () => {
    _app.post("/api/sumToAirshotRank", async (req,res) => {
        let airshot = req.body;
        await sumAirshotToAirshotRanking(airshot.ShooterID, airshot.VictimID, airshot.distance)
        .then(() => {
            res.send("Airshot registered and sum");
        }).catch((err) => {
            res.send(`Retrieved error while registering airshot to server ${err}`);
        })
    })
}


const registerEndpoints = (app, discordClient) => {
    _app = app
    logsEndpoint(discordClient);
    winnersEndpoint();
    ladderEndpoint();
    teamsEndpoint(discordClient);
    testEndpoint();
    airEndpoint();
}

module.exports = { registerEndpoints }  