const fs = require('fs');
const config = require('../../config/config.json')
const { getQueue, updateQueue } = require('./queueHandler');
const { createMatch} = require('../match/matchFunctions');
const { queueEmbed } = require('./queueEmbeds')

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
        message.channel.send("Doing matchmaking")
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

module.exports = {addToQueue, leaveToQueue}