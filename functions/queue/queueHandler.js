const fs = require('fs')

function getQueue(){
    var queue = require("./queueData.json");
    return queue;
}

function updateQueue(queue){
    let data = JSON.stringify(queue);
    fs.writeFileSync("./functions/queue/queueData.json", data);
}

module.exports = {getQueue, updateQueue}