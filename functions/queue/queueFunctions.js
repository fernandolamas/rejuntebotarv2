const fs = require('fs');
const config = require('../../config/config.json')
const { getQueue, updateQueue, getBansID, updateBans, addToBans, timeoutBans, deleteQueue } = require('./queueHandler');
const { createMatch } = require('../match/matchFunctions');
const { queueEmbed } = require('./queueEmbeds');
const { getUserFromMention } = require('../generalFunctions');
const { getUsersInMatchsIncomplete, getAvailableServers, getMatchIncomplete, setMatchCancelled } = require('../match/matchHandler');
var timeOutQueue;


function checkInMatchIncomplete(message) {
    var usersInMatch = getUsersInMatchsIncomplete();
    if (usersInMatch.includes(message.author.id)) {
        message.channel.send("You are playing a match, finish it.")
        return true;
    }
    return false;
}

function unbanPlayerFromQueue(message, args) {
    var bansid = getBansID();
    var userid = getUserFromMention(args[0]);
    if (bansid.includes(userid)) {
        updateBans(userid);
        message.channel.send(`${args[0]} has been unbanned from the Queue`)
    }
    else {
        message.channel.send(`${args[0]} is not banned from the Queue`)
    }
}

function banPlayerFromQueue(message, args) {
    var bansid = getBansID();
    var userid = getUserFromMention(args[0]);
    var timeout = args[1];
    /*var reason = "";
    args.forEach(a => {
        reason += `${a} `;
    });
    console.log(reason);*/
    if (!bansid.includes(userid)) {
        addToBans(userid, timeout);
        message.channel.send(`${args[0]} has been banned from the Queue`)
    }
    else {
        message.channel.send("This users are already banned from the Queue")
        return;
    }

    kickFromQueue(message, args)
}

function kickFromQueue(message, args) {
    var userid = getUserFromMention(args[0]);
    var queue = getQueue()
    if (queue.includes(userid)) {
        updateQueue(queue, userid, "r")
        queueEmbed(message, getQueue());
        return;
    }

    var matchs = getMatchIncomplete();
    var oldQueue = []
    matchs.forEach(m => {
        if (m.team1.includes(userid) || m.team2.includes(userid)) {
            oldQueue = m.team1.concat(m.team2);
            updateQueue(oldQueue, userid, "r");
            queueEmbed(message, getQueue());
            setMatchCancelled(m.id);
            message.channel.send(`User <@!${userid}> has been kicked from the queue, match has been cancelled, going to queue again...`)
        }
    })

}

function showQueue(message) {
    queueEmbed(message, getQueue())
}

function addToQueue(message) {

    if (checkInMatchIncomplete(message)) {
        return;
    }

    if (getMatchIncomplete().length > 0) {
        message.channel.send("There already is a match in progress!  Please check the status of it with !matches")
    }

    var bans = getBansID();
    if (bans.includes(message.author.id)) {
        message.author.send("You are banned from the Queue, contact with an administrator")
        timeoutBans(message.author.id)
        return;
    }

    var queue = getQueue();
    if (queue.length === config.matchsize) {
        message.channel.send("Queue full")
        return;
    }

    if (getAvailableServers().length === 0) {
        message.channel.send("No available servers to play.")
        return;
    }

    if (!queue.includes(message.author.id)) {
        updateQueue(queue, message.author.id, "a")
        //message.channel.send("Added to Queue")
        queueEmbed(message, queue);
    }
    else {
        message.channel.send("You are already in the Queue");
        return;
    }

    clearTimeout(timeOutQueue);
    timeOutQueue = setTimeout(function () {
        deleteQueue()
        message.channel.send("Clearing Queue");
    }, config.matchTimeout)

    if (queue.length === config.matchsize) {
        createMatch(message);
    }
}

function leaveToQueue(message) {

    if (checkInMatchIncomplete(message)) {
        return;
    }

    var queue = getQueue();
    if (queue.includes(message.author.id)) {
        updateQueue(queue, message.author.id, "r")
        //message.channel.send("Leave from Queue")
        queueEmbed(message, getQueue());
    }
    else {
        message.channel.send("You are not in the Queue");
        return;
    }
}

function swapPlayerFromQueue(message, args) {


    let player1 = args[0].replace(/[\\<>@#&!]/g, "");
    let player2 = args[1].replace(/[\\<>@#&!]/g, "");

    var queue = getQueue();
    if (!queue.includes(player2)) {
        if (queue.includes(player1)) {
            updateQueue(queue, player2, "a");
            kickFromQueue(message, args);
        } else {
            message.channel.send(`<@${player1}> is not in the current queue`);
        }
    } else {
        message.channel.send(`<@${player2}> is already on the queue`);
    }

}

function insertPlayerIntoQueue(message, args) {
    if(args[0] === undefined || args[0] === null || !/<@.?[0-9]*?>/.test(args[0])) {
        message.channel.send("Failed to find the discord user");
        return;
    }
    player1 = getUserFromMention(args[0]);

    if (checkInMatchIncomplete(message)) {
        return;
    }

    if (getMatchIncomplete().length > 0) {
        message.channel.send("There already is a match in progress!  Please check the status of it with !matches")
    }

    var queue = getQueue();
    if (queue.length === config.matchsize) {
        message.channel.send("Queue full")
        return;
    }

    if (getAvailableServers().length === 0) {
        message.channel.send("No available servers to play.")
        return;
    }

    if (!queue.includes(player1)) {
        updateQueue(queue, player1, "a")
        //message.channel.send("Added to Queue")
        queueEmbed(message, queue);
    }
    else {
        message.channel.send("You are already in the Queue");
        return;
    }

    clearTimeout(timeOutQueue);
    timeOutQueue = setTimeout(function () {
        deleteQueue()
        message.channel.send("Clearing Queue");
    }, config.matchTimeout)

    if (queue.length === config.matchsize) {
        createMatch(message);
    }
}

module.exports = { showQueue, addToQueue, leaveToQueue, banPlayerFromQueue, unbanPlayerFromQueue, kickFromQueue, swapPlayerFromQueue, insertPlayerIntoQueue }