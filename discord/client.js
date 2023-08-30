const express = require('express');
const { retrieveDiscordConnection } = require('../functions/discordClient/builder')
const { registerEndpoints } = require('../functions/endpoints/endpoints.js');
const { registerExternalEndpoints } = require('../functions/endpoints/externalEndpoints');
const { showLadder, showEloLadder } = require('../functions/ranking/ladder')
const { showAirshotLadder } = require('../functions/ranking/airshot/ladder')

const app = express();
const port = 3000;
const external_app = express();
const external_port = 3001

const init = async () => {
    let client = await retrieveDiscordConnection();
    const express = require('express')
    app.use(express.json());
    app.listen(port, () => {
        console.log(`Listening to port ${port}`)
    })
    external_app.use(express.json());
    external_app.listen(external_port, () => {
        console.log(`Listening to port ${external_port}`)
    })

    registerEndpoints(app, client);
    registerExternalEndpoints(external_app,client)
    await showLadder(client).catch(console.error).then(async () => {
        setTimeout(async () => {
            await showAirshotLadder(client).catch(console.error).then(async () => {
                setTimeout(async () => {
                    await showEloLadder(client).catch(console.error);
                }, 10000)
            });
            
        }, 10000)
    })
}


module.exports = { init }