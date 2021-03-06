const Discord = require("discord.js");
const client = new Discord.Client();
const {token} = require("./token.json");
const {prefix} = require("./config.json");
const aliases = requie("./commands.json");

client.on('message', message => {

    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    //input= !maxsize 2
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    // prefix = "!"
    // command = "maxsize"
    // args = ["2"]

    if(aliases.addCommands.includes(command))
    {
        try{
            
            //funcion de agregar jugador a rejunte
        }
        catch(e){
            console.log(e)
        }
        return;
    }

    if(aliases.removeCommands.includes(command))
    {
        try{
            //funcion de sacar jugador de rejunte
        }
        catch(e){
            console.log(e)
        }
    }
})

client.once("ready", () => {
    console.log("Startup complete");
});

client.login(token);