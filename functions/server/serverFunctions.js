const fs = require('fs');
const Compute = require("@google-cloud/compute");
const { getAllServers, getAvailableServers } = require('../match/matchHandler');
const compute = new Compute();
const _servernameArray = getAllServers();
var timeoutBR;
var timeoutUSE;
var timeoutUSC;

let availableServers = {
    brasil:{
        name: 'brasil',
        timeout: undefined,
        info: 'Brasil Server Connect Here -> steam://connect/34.95.232.99:27015/rjt'
    },
    useast: {
        name: 'useast',
        timeout: undefined,
        info: 'US East Connect Here -> steam://connect/34.86.237.46:27015/rjt'
    },
    uscentral: {
        name: 'uscentral',
        timeout: undefined,
        info: 'US Central Connect Here -> steam://connect/34.136.53.33:27015/rjt'
    }
};



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
        //TODO: return a list of available servers
        message.channel.send('Server is not recognized by the bot available servers: ');
        return;
    }

    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.start(function (err, operation, apiResponse) {
		/*
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
		*/
    });
	message.channel.send(`${_servername} Server going up`)
}

function turnOffServer(message, _servername) {

    if(!_servernameArray.includes(_servername)) 
    {
        message.channel.send('Server is not recognized by the bot available servers: ');
        return;
    }
    
    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.stop(function (err, operation, apiResponse) {
		/*
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
		*/
    });
	message.channel.send(`Server ${_servername} going down`)
}


function turnOnServerWithTimer(message, _servername) {

    turnOnServer(message,_servername)
    /*switch(_servername){
        case 'brasil':
            clearTimeout(timeoutBR)
            timeoutBR = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
        case 'useast':
            clearTimeout(timeoutUSE)
            timeoutUSE = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
        case 'uscentral':
            clearTimeout(timeoutUSC)
            timeoutUSC = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
    }*/
    /*lo digo una vez mas, te re complicas fer
    console.log(`Shutdown of the server ${_servername} programmed for 1h 30m`);
    //default 4680000
    //testing with 300000 (5 minutes)*/
    clearTimeout(availableServers[_servername].timeout);
    availableServers[_servername].timeout = setTimeout(turnOffServer, 4680000, message, _servername);
    
}

function sendServerInfo(message, _servername)
{
    if(_servername === 'all')
    {
        message.channel.send(`Brasil Server Connect Here -> steam://connect/34.95.232.99:27015/rjt
        US Central Connect Here -> steam://connect/34.136.53.33:27015/rjt
        US East Connect Here -> steam://connect/34.86.237.46:27015/rjt`)
        return;
    }
    if(!_servernameArray.includes(_servername)) 
    {
        //TODO: return a list of available servers
        let serversInMatch = getAvailableServers().join(', ')
        if(serversInMatch){
            message.channel.send('Available servers: ' + serversInMatch )
        }
        
        message.channel.send('Connection info with !serverinfo brasil, useast, uscentral');
        return;
    }

    message.channel.send(availableServers[_servername].info)
}

module.exports = { turnOnServer, turnOffServer, turnOnServerWithTimer, sendServerInfo};