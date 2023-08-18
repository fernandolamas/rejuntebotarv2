const { retrieveDiscordConnection } = require('../functions/discordClient/builder')
const { registerEndpoints } = require('../functions/endpoints/endpoints.js');
const { showLadder } = require('../functions/ranking/ladder')
const { showAirshotLadder } = require('../functions/ranking/airshot/ladder')

const init = async (app, port) => {
    let client = await retrieveDiscordConnection();
    const express = require('express')
    app.use(express.json());
    app.listen(port, () => {
        console.log(`Listening to port ${port}`)
    })
    registerEndpoints(app, client);
    await showLadder(client).catch(console.error).then(async () => {
        setTimeout(async () => {
            await showAirshotLadder(client).catch(console.error);
        }, 10000)
    })
}


module.exports = { init }