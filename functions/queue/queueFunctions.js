const fs = require('fs');
const { getQueue, setQueue } = require('./queueHandler');

module.exports = {

    addToQueue: function addToQueue(client, message){
        
        var queue = getQueue();
        if(!queue.includes(message.author.id)){
            setQueue(queue.push(message.author.id))
        }
        else
        {
            message.channel.send("You are already in the Queue");
            return;
        }
        

    }

}