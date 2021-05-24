const fs = require('fs')
const path = './functions/queue/queueData.json';

function getQueue(){
    var file = fs.readFileSync(path);
    let queue = JSON.parse(file);
    return queue;
}

function updateQueue(queue){
    let data = JSON.stringify(queue);
    fs.writeFileSync(path, data);
}

function deleteQueue(){
    let data = JSON.stringify([]);
    fs.writeFileSync(path,data);
}

module.exports = {getQueue, updateQueue, deleteQueue}