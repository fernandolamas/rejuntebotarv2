import { Client } from 'discord.js';
import { handleMessage } from '../msg/handler.js';
//should be env variable

let client = null;
let discordToken = "NzM0NTc4MDA5NDIzNzQwOTM5.XxTvFQ.WQpGeJhIhUw4iJC1dm_tQlGT40M";

export const init = () => {

    client = new Client()
    if (!discordToken) {
        throw new Error('Missing env variable PICKUPBOT_DISCORD_TOKEN');
    }

    console.debug('Discord token loaded successfully from env variable');


    client.on("ready", () => {
        console.log("Startup complete");
    }),

        client.on('message', msg => {
            handleMessage(msg);
        }),

        client.login(discordToken);
}