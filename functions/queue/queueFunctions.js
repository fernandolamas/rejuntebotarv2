const fs = require('fs');
const { getQueue, updateQueue } = require('./queueHandler');

function addToQueue(message){

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

function leaveToQueue(message){

    var queue = getQueue();
    if(queue.includes(message.author.id)){
        queue = queue.filter((id) => id !=message.author.id)
        updateQueue(queue)
    }
    else
    {
        message.channel.send("You are not in the Queue");
        return;
    }
}

module.exports = {addToQueue, leaveToQueue}