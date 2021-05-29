const fs = require('fs');
const Compute = require("@google-cloud/compute");
const { getServers } = require('../match/matchHandler');
const { Message } = require('discord.js');
const compute = new Compute();
const _servernameArray = getServers();

/*
                brasil,
                uscentral,
                useast       
*/


// US CENTRAL
const zonecentral = compute.zone("us-central1-a");
const vmcentral = zonecentral.vm("tfc-central");


// US east
const zoneeast = compute.zone("us-east4-c");
const vmeast = zoneeast.vm("tfc-east");


//BRasil
const zonebr = compute.zone("southamerica-east1-b");
const vmbr = zonebr.vm("tfctestbr");

const DEFAULTVM = vmbr;
const SELECTVM = {
    'brasil': vmbr,
    'useast': vmeast,
    'uscentral': vmcentral
}



function turnOnServer(message, _servername) {


    if(!_servernameArray.includes(_servername)) 
    {
        message.channel.send(`Server is not recognized by the bot available servers: \nAvailable Options ``${_servernameArray}```);
        return;
    }

    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.start(function (err, operation, apiResponse) {
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
    });
}

function turnOffServer(_servername) {

    if(!_servernameArray.includes(_servername)) 
    {
        message.channel.send(`Server is not recognized by the bot available servers: \nAvailable Options ``${_servernameArray}```);
        return;
    }
    
    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.stop(function (err, operation, apiResponse) {
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
    });
}

module.exports = { turnOnServer, turnOffServer };