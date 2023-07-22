const { retrieveConnection } = require('../functions/discord/discord')
const { registerEndpoints } = require('../functions/endpoints/endpoints.js');

const init = async (app, port) => {
    await retrieveConnection();
    app.listen(port, () => {
        console.log(`Listening to port ${port}`)
    })
    registerEndpoints(app);
}


module.exports = { init }