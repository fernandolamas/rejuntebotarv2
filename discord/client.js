let { Client } = require('discord.js');
let { handleMessage } = require('../msg/handler.js');
let { token } = require('../config/token.json');
//should be env variable

let client = null;
let discordToken = null;

const init = () => {

        client = new Client()
        discordToken = token;
        if (!discordToken) {
            throw new Error('Missing variable token');
        }

        console.debug('Discord token loaded successfully from json');


        client.on("ready", () => {
            console.log("Startup complete");
        }),

            client.on('message', msg => {
                handleMessage(msg);
            }),

            client.login(discordToken);
    }


module.exports = {init}