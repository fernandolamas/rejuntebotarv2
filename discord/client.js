import { Client } from 'discord.js';
import { handleMessage } from '../msg/handler';
//should be env variable
const {token} = require("./token.json");

export const init = () => {
    client = new Client()
}


client.once("ready", () => {
    console.log("Startup complete");
}),

client.on('message', msg => {
    handleMessage(msg);
}),

client.login(token);