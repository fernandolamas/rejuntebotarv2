const fs = require('fs');
const { getQueue, updateQueue } = require('./queueHandler');

function addToQueue(client, message){

    var queue = getQueue();
    if(!queue.includes(message.author.id)){
        queue.push(message.author.id)
        updateQueue(queue)
    }
    else
    {
        message.channel.send("You are already in the Queue");
        return;
    }
}

function leaveToQueue(client, message){

    var queue = getQueue();
    if(queue.includes(message.author.id)){
        queue.filter((id) => id !=message.author.id)
    }
    else
    {

    }
}

module.exports = {addToQueue, leaveToQueue}