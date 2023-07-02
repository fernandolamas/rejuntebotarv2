let { GatewayIntentBits, Client, EmbedBuilder } = require('discord.js');
let { handleMessage } = require('../msg/handler.js');
let { token } = require('../config/token.json');
const { setMatchAllComplete } = require('../functions/match/matchHandler.js');
const { registerEndpoints } = require('../functions/endpoints/endpoints.js');
//should be env variable

let client = null;
let discordToken = null;

const init = (app, port) => {

    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessageReactions,
        ],
    })
    discordToken = token;
    if (!discordToken) {
        throw new Error('Missing variable token');
    }

    console.debug('Discord token loaded successfully from json');


    client.on("ready", () => {
        console.log("Startup complete");
        setMatchAllComplete();
        //const canal = client.channels.cache.get("1112438054175641610")
        //canal.send('sale mix?')
    }),

        client.on('messageCreate', async msg => {
            handleMessage(msg);
        }),

        client.login(discordToken)
        .then(() => 
        {
            console.log("Bot connected to discord");
            app.listen(port, () => {
                console.log(`Listening to port ${port}`)
            })
            registerEndpoints(app);
        }).catch(error => console.error("Error while connecting to discord", error))
}


module.exports = { init }