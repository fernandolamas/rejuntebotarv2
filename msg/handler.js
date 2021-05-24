const {prefix} = require('../config/config.json');
const aliases = require('../config/commands.json');
const { addToQueue } = require('../functions/queue/queueFunctions');


const handleMessage = (msg) => {

    if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === 'dm') return;

    //input= !maxsize 2
    const args = msg.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    // prefix = "!"
    // command = "maxsize"
    // args = ["2"]

    if(aliases.addCommands.includes(command))
    {
        try{
            addToQueue(undefined, msg)
            return;
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
}

module.exports = {handleMessage }