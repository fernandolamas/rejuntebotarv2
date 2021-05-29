const { prefix } = require('../config/config.json');
const aliases = require('../config/commands.json');

const { turnOnServer, turnOffServer } = require('../functions/server/serverFunctions')
const { getDemos } = require('../functions/demos/demosFunctions');


const { addToQueue, leaveToQueue } = require('../functions/queue/queueFunctions');
const { addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue } = require('../functions/queue/queueFunctions');


const handleMessage = (msg) => {

    var havePrefix = false;

    for (let index = 0; index < prefix.length; index++) {
        if (msg.content.startsWith(prefix[index])) havePrefix = true;
    }

    if (!havePrefix || msg.author.bot || msg.channel.type === 'dm') return;

    //input= !maxsize 2
    const args = msg.content.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    // prefix = "!"
    // command = "maxsize"
    // args = ["2"]

    if (aliases.addCommands.includes(command)) {
        try {
            addToQueue(msg)
        }
        catch (e) {
            console.log(e)
        }
        return;
    }

    if (aliases.removeCommands.includes(command)) {
        try {
            leaveToQueue(msg)
            
        }
        catch (e) {
            console.log(e)
        }
        return;
    }

    if(aliases.bansCommands.includes(command))
    {
        try
        {
            banPlayerFromQueue(msg, args)
        }
        catch(e)
        {
            console.log(e)
        }
        return;
    }

    if(aliases.unbansCommands.includes(command))
    {
        try
        {
            unbanPlayerFromQueue(msg, args)
        }
        catch(e)
        {
            console.log(e)
        }
        return;
    }
    if(aliases.downloadDemoCommands.includes(command))
    {
        //up server function(args)
        try {
            getDemos(msg);
        } catch (error) {
            console.log(error)
        }
  
        return;
    }
    if (aliases.serverUp.includes(command)) {
        try {
            const _servername = {
                brasil,
                uscentral,
                useast                
            }
            
            if(!args === _servername){
                msg.channel.send("Server is not recognized by the bot");
            }else{
                turnOnServer(args);
            }

        } catch (e) {
            console.log(e)
        }
    }

    if (aliases.serverDown.includes(command)) {
        try {
            const _servername = {
                brasil,
                uscentral,
                useast                
            }
            
            if(!args === _servername){
                msg.channel.send("Server is not recognized by the bot");
            }else{
                turnOffServer(args);
            }

        } catch (e) {
            console.log(e)
        }
        return;
    }
}

module.exports = {handleMessage}
