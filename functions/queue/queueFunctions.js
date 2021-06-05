const fs = require('fs');
const config = require('../../config/config.json')
const { getQueue, updateQueue, getBansID, updateBans, addToBans, timeoutBans, deleteQueue } = require('./queueHandler');
const { createMatch} = require('../match/matchFunctions');
const { queueEmbed } = require('./queueEmbeds');
const { getUserFromMention } = require('../generalFunctions');
const { getUsersInMatchsIncomplete, getAvailableServers, getMatchIncomplete } = require('../match/matchHandler');

function checkInMatchIncomplete(message){
    var usersInMatch = getUsersInMatchsIncomplete();
    if(usersInMatch.includes(message.author.id)){
        message.channel.send("You are playing a match, finish them.")
        return true;
    }
    return false;
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
    /*var reason = "";
    args.forEach(a => {
        reason += `${a} `;
    });
    console.log(reason);*/
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

function kickFromQueue(message, args){
    var userid = getUserFromMention(args[0]);
    var queue = getQueue()
    if(queue.includes(userid))
    {
        updateQueue(queue,userid,"r")
        queueEmbed(message, getQueue());
    }
}

function addToQueue(message){

    if(checkInMatchIncomplete(message))
    {
        return;
    }

    if(getMatchIncomplete().length > 0){
        message.channel.send("There already is a match in progress!  Please check the status of it with !matches")
    }
    
    var bans = getBansID();
    if(bans.includes(message.author.id))
    {
        message.author.send("You are banned from the Queue, contact with an administrator")
        timeoutBans(message.author.id)
        return;
    }

    var queue = getQueue();
    if(queue.length === config.matchsize)
    {
        message.channel.send("Queue full")
        return;
    }

    if(getAvailableServers().length === 0){
        message.channel.send("No available servers to play.")
        return;
    }

    if(!queue.includes(message.author.id)){
        updateQueue(queue, message.author.id, "a")
        //message.channel.send("Added to Queue")
        queueEmbed(message, queue);
    }
    else
    {
        message.channel.send("You are already in the Queue");
        return;
    }

    setTimeout(function(){
        deleteQueue()
        message.channel.send("Clearing Queue");
    }, config.matchTimeout)

    if(queue.length === config.matchsize){
        createMatch(message);
    }
}

function leaveToQueue(message){

    if(checkInMatchIncomplete(message))
    {
        return;
    }

    var queue = getQueue();
    if(queue.includes(message.author.id)){
        updateQueue(queue, message.author.id, "r")
        //message.channel.send("Leave from Queue")
        queueEmbed(message, getQueue());
    }
    else
    {
        message.channel.send("You are not in the Queue");
        return;
    }
}

module.exports = {addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue, kickFromQueue}