const { staffRoleID, adminRoleID, prefix } = require('../config/config.json');
const aliases = require('../config/commands.json');

const { turnOnServer, turnOffServer, sendServerInfo } = require('../functions/server/serverFunctions')

const { voteFor } = require('../functions/generalFunctions');
const { addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue, kickFromQueue, showQueue, swapPlayerFromQueue, insertPlayerIntoQueue, noticeCurrentPickup, removeTimeoutFromCurrentQueue, clearQueue, registerDelayedPlayer } = require('../functions/queue/queueFunctions');
const { showMatchIncompletes, cancelMatch, shuffleTeams, reRollMaps } = require('../functions/match/matchFunctions');
const { sendRconResponse } = require('../functions/server/rcon/rconFunctions');
const { checkStatus } = require('../functions/status/statusFunctions');
const { downloadFiles } = require('../functions/logs/logsFunctions.js');
const { registerPlayer } = require('../functions/database/dbFunctions/register');
const { getLadder } = require('../functions/ranking/ladder');
const { setManualRanking, setManualRankingByName } = require('../functions/ranking/counters');


function checkHasStaffRole(message) {
    return message.member.roles.cache.some(role => role.id == staffRoleID);
}
function checkHasAdminRole(message) {
    return message.member.roles.cache.some(role => role.id == adminRoleID);
}

const handleMessage = async (msg, client) => {
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
        if (aliases.addWithWait.includes(command)) {
            registerDelayedPlayer(msg)
            return;
        }

        if (aliases.matchViewCommands.includes(command)) {
            showMatchIncompletes(msg);
            return;
        }

        if (aliases.queueCommands.includes(command)) {
            showQueue(msg);
            return;
        }

        if (aliases.rconCommands.includes(command)) {
            //command:rcon  args:brasil teams which the server is [0] in the array brasil
            sendRconResponse(msg, args)
            return;
        }

        if (aliases.voteForCommand.includes(command)) {
            voteFor(msg, args);
            return;
        }
        if (aliases.serverInfoCommands.includes(command)) {
            sendServerInfo(msg, args[0])
            return;
        }

        if (aliases.preventQueueExpiration.includes(command)) {
            removeTimeoutFromCurrentQueue()
            return;
        }
        if (aliases.noticePickup.includes(command)) {
            noticeCurrentPickup(msg)
            return;
        }

        if (aliases.ranking.includes(command)) {
            await getLadder(msg, client);
            return;
        }

        if (checkHasStaffRole(msg)) {

            if (aliases.stats.includes(command)) {
                //downloadFiles()
                return;
            }

            if (aliases.reRollMaps.includes(command)) {
                reRollMaps(msg);
                return;
            }

            if (aliases.clearqueue.includes(command)) {
                clearQueue(msg);
                return;
            }

            if (aliases.countRanking.includes(command)) {
                downloadFiles(client);
                let d = new Date()
                msg.channel.send(`Ranking updated at ${d}`);
                return;
            }

            if (args.length > 0) {
                if (checkHasAdminRole(msg)) {
                    if(aliases.setRanking.includes(command))
                    {
                        setManualRanking(msg,args[0],args[1],args[2])
                        return;
                    }
                    if(aliases.setRankingByName.includes(command))
                    {
                        setManualRankingByName(msg,args[0],args[1],args[2])
                        return;
                    }
                }

                if (aliases.checkStatus.includes(command)) {
                    //checkStatus(msg,args)
                    console.log("Obsolete function !status")
                    return;
                }
                if (aliases.insertCommands.includes(command)) {
                    insertPlayerIntoQueue(msg, args)
                    return;
                }

                if (aliases.swapCommands.includes(command)) {
                    swapPlayerFromQueue(msg, args);
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

                if (aliases.registerPlayers.includes(command)) {
                    registerPlayer(msg, args[0], args[1], args[2], args[3]);
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
