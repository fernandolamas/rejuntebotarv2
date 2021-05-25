const fs = require('fs')
const path = './functions/queue/queueData.json';
const pathBan = './functions/queue/queuePlayerBan.json'
const { queueEmbed } = require('./queueEmbeds')

function getBansID(){
    var file = fs.readFileSync(pathBan);
    let bans = JSON.parse(file);
    var bansid = []
    bans.forEach(userBan => {
        bansid.push(userBan.userid)
    });
    return bansid;
}

function getBans(){
    var file = fs.readFileSync(pathBan);
    let bans = JSON.parse(file);
    return bans;
}

function updateBans(userid){
    var bans = getBans();
    bans = bans.filter(ban => ban.userid != userid);
    let data = JSON.stringify(bans);
    fs.writeFileSync(pathBan, data);
}

function timeoutBans(userid){
    var bans = getBansID()
    var indexBanned = bans.indexOf(userid);
    bans = getBans();
    var user = bans[indexBanned];
    console.log(user);
    setTimeout(function(){updateBans(userid)}, user.timeout*60*1000);
}

function addToBans(user, timeout){
    var bans = getBans()
    if(!timeout) timeout = 30;
    bans.push({
        "userid": user,
        "timeout": timeout
    })
    let data = JSON.stringify(bans);
    fs.writeFileSync(pathBan, data);
}

function getQueue(){
    var file = fs.readFileSync(path);
    let queue = JSON.parse(file);
    return queue;
}

function updateQueue(queue, userid, option){
    switch(option){
        case "a":
            queue.push(userid)
            break;
        case "r":
            queue = queue.filter((id) => id != userid)
            break;
    }
    let data = JSON.stringify(queue);
    fs.writeFileSync(path, data);
}

function deleteQueue(){
    let data = JSON.stringify([]);
    fs.writeFileSync(path,data);
}

module.exports = {getQueue, updateQueue, deleteQueue, addToBans, getBans, getBansID, updateBans, timeoutBans}