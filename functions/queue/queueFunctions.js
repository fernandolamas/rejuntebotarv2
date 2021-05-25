const fs = require('fs');
const config = require('../../config/config.json')
const { getQueue, updateQueue, banFromQueue, getBans, getBansID, updateBans } = require('./queueHandler');
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
        banFromQueue(userid, timeout);
        message.channel.send(`${args[0]} has been banned from the Queue`)
    }
    else 
    {
        message.channel.send("This users are already banned from the Queue")
    }
}

function addToQueue(message){

    var queue = getQueue();
    if(!queue.includes(message.author.id)){
        queue.push(message.author.id)
        updateQueue(queue)
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
        queue = queue.filter((id) => id !=message.author.id)
        updateQueue(queue)
        message.channel.send("Leave from Queue")
    }
    else
    {
        message.channel.send("You are not in the Queue");
        return;
    }
}

module.exports = {addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue}