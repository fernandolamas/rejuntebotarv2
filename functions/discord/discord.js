let { GatewayIntentBits, Client, EmbedBuilder } = require('discord.js');
let { token } = require('../../config/token.json');
let { handleMessage } = require('../../msg/handler.js');
const { setMatchAllComplete } = require('../match/matchHandler');
//To-Do env variable

let client = null;
let discordToken = null;
let discordInstance = null;

function createDiscordInstance() {
    return new Promise(async (resolve, reject) => {
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

        await client.login(discordToken)
            .then(() => {
                resolve(client)
                console.log("Bot connected to discord");

            }).catch((error) => 
            {
                console.error("Error while connecting to discord", error)
                reject(error);
            })
    })
}

async function retrieveConnection() {
    return discordInstance === null ? discordInstance = await createDiscordInstance() : discordInstance;
}

module.exports = { retrieveConnection }