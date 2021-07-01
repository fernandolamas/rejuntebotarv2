const { staffRoleID, prefix } = require('../config/config.json');
const aliases = require('../config/commands.json');

const { turnOnServer, turnOffServer, sendServerInfo } = require('../functions/server/serverFunctions')
const { getDemos } = require('../functions/demos/demosFunctions');

const { voteFor } = require('../functions/generalFunctions');
const { addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue, kickFromQueue, showQueue, swapPlayerFromQueue, insertPlayerIntoQueue, noticeCurrentPickup} = require('../functions/queue/queueFunctions');
const { showMatchIncompletes, cancelMatch, shuffleTeams } = require('../functions/match/matchFunctions');
const { sendRconResponse } = require('../functions/server/rcon/rconFunctions');


function checkHasStaffRole(message) {
    return message.member.roles.cache.some(role => role.id == staffRoleID);
}

const handleMessage = (msg) => {

    var havePrefix = false;

    for (let index = 0; index < prefix.length; index++) {
        if (msg.content.startsWith(prefix[index])) havePrefix = true;
    }

    if (!havePrefix || msg.channel.type === 'dm') return;

    //input= !maxsize 2
    const args = msg.content.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    // prefix = "!"
    // command = "maxsize"
    // args = ["2"]

    try {

        if (aliases.addCommands.includes(command)) {
            addToQueue(msg)
            return;
        }

        if (aliases.removeCommands.includes(command)) {
            leaveToQueue(msg)
            return;
        }

        if (aliases.downloadDemoCommands.includes(command)) {
            getDemos(msg);
            return;
        }

        if (aliases.matchViewCommands.includes(command)) {
            showMatchIncompletes(msg);
            return;
        }

        if(aliases.queueCommands.includes(command)){
            showQueue(msg);
            return;
        }

        if(aliases.rconCommands.includes(command)){
            //command:rcon  args:brasil teams which the server is [0] in the array brasil
            sendRconResponse(msg, args)
            return;
        }
        
        if (aliases.voteForCommand.includes(command)){
            voteFor(msg,args);
            return;
        }
        if (aliases.serverInfoCommands.includes(command)){
            sendServerInfo(msg,args[0])
            return;
        }

        if (checkHasStaffRole(msg)) {
            if (aliases.noticePickup.includes(command)){
                noticeCurrentPickup(msg)
                return;
            }
            if (args.length > 0) {
                if (aliases.insertCommands.includes(command)) {
                    insertPlayerIntoQueue(msg,args)
                    return;
                }

                if (aliases.swapCommands.includes(command)) {
                    swapPlayerFromQueue(msg,args);
                    return;
                }

                if (aliases.kickCommands.includes(command)) {
                    kickFromQueue(msg, args)
                    return;
                }

                if (aliases.bansCommands.includes(command)) {
                    banPlayerFromQueue(msg, args)
                    return;
                }

                if (aliases.unbansCommands.includes(command)) {
                    unbanPlayerFromQueue(msg, args)
                    return;
                }

                if (aliases.serverUp.includes(command)) {
                    turnOnServer(msg, args[0]);
                    return;
                }

                if (aliases.serverDown.includes(command)) {
                    turnOffServer(msg, args[0]);
                    return;
                }

                if (aliases.matchAbortCommands.includes(command)) {
                    cancelMatch(msg, args[0])
                    return;
                }

                if (aliases.matchShuffleCommands.includes(command)) {
                    shuffleTeams(msg, args[0])
                    return;
                }
            } else {
                msg.channel.send(`<@!${msg.author.id}> arguments are needed`)
            }
        } else {
            return;
        }

    } catch (e) {
        console.log("ERROR ON COMMAND: ", command)
        console.log(e)
    }

}

module.exports = { handleMessage }
