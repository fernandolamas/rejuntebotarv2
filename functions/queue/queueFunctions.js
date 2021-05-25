const fs = require('fs');
const config = require('../../config/config.json')
const { getQueue, updateQueue, banFromQueue, getBans, getBansID, updateBans, addToBans, timeoutBans } = require('./queueHandler');
const { createMatch} = require('../match/matchFunctions');
const { queueEmbed } = require('./queueEmbeds')

function getUserFromMention(mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return mention;
	}
}

function unbanPlayerFromQueue(message, args)
{
    var bansid = getBansID();
    var userid = getUserFromMention(args[0]);
    if(bansid.includes(userid)) 
    {
        updateBans(userid);
        message.channel.send(`${args[0]} has been unbanned from the Queue`)
    }
    else
    {
        message.channel.send(`${args[0]} is not banned from the Queue`)
    }
}

function banPlayerFromQueue(message, args){
    var bansid = getBansID();
    var userid = getUserFromMention(args[0]);
    var timeout = args[1];
    if(!bansid.includes(userid)) 
    {
        addToBans(userid, timeout);
        message.channel.send(`${args[0]} has been banned from the Queue`)
    }
    else 
    {
        message.channel.send("This users are already banned from the Queue")
        return;
    }

    var queue = getQueue()
    if(queue.includes(userid))
    {
        updateQueue(queue,userid,"r")
        queueEmbed(message, getQueue());
    }
}

function addToQueue(message){

    var bans = getBansID();
    if(bans.includes(message.author.id))
    {
        message.author.send("You are banned from the Queue, contact with an administrator")
        timeoutBans(message.author.id)
        return;
    }

    var queue = getQueue();
    if(!queue.includes(message.author.id)){
        updateQueue(queue, message.author.id, "a")
        message.channel.send("Added to Queue")
        queueEmbed(message, queue);
    }
    else
    {
        message.channel.send("You are already in the Queue");
        return;
    }

    if(queue.length === config.matchsize){
        createMatch(message);
    }
}

function leaveToQueue(message){

    var queue = getQueue();
    if(queue.includes(message.author.id)){
        updateQueue(queue, message.author.id, "r")
        message.channel.send("Leave from Queue")
        queueEmbed(message, getQueue());
    }
    else
    {
        message.channel.send("You are not in the Queue");
        return;
    }
}

module.exports = {addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue}