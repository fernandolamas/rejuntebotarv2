const { retrieveDiscordConnection } = require('../functions/discordClient/builder')
const { registerEndpoints } = require('../functions/endpoints/endpoints.js');
const { showLadder } = require('../functions/ranking/ladder')

const init = async (app, port) => {
    let client = await retrieveDiscordConnection();
    app.listen(port, () => {
        console.log(`Listening to port ${port}`)
    })
    registerEndpoints(app, client);
    await showLadder(client).catch(console.error);
}


module.exports = { init }