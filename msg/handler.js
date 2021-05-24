const {prefix} = require('../config/config.json');
const aliases = require('../config/commands.json');
const { addToQueue, leaveToQueue } = require('../functions/queue/queueFunctions');


const handleMessage = (msg) => {

    var havePrefix = false;

    for (let index = 0; index < prefix.length; index++) {
        if(msg.content.startsWith(prefix[index])) havePrefix=true;
    }

    if (!havePrefix || msg.author.bot || msg.channel.type === 'dm') return;

    //input= !maxsize 2
    const args = msg.content.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    // prefix = "!"
    // command = "maxsize"
    // args = ["2"]

    if(aliases.addCommands.includes(command))
    {
        try{
            addToQueue(msg)
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
            leaveToQueue(msg)
            return;
        }
        catch(e){
            console.log(e)
        }
    }
}

module.exports = {handleMessage }