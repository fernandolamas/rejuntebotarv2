const { modifyQueueFromEndpoint } = require('../queue/queueFunctions.js');
let _app;

const queueManagerEndpoint = (discordClient) =>
{
    _app.post("/api/changeQueue", async (req,res) => {
        console.log("Server is listening to queue endpoint")
        try{
            let players = req.body
            modifyQueueFromEndpoint(players.action,players.playerList,discordClient)
        }catch(error)
        {
            console.error(error);
        }finally{
            res.send("Queue changing endpoint replying to your request");
        }
    })
}

const registerExternalEndpoints = (app, discordClient) => {
    _app = app
    queueManagerEndpoint(discordClient);
}

module.exports = { registerExternalEndpoints }