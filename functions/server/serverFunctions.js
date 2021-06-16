const fs = require('fs');
const Compute = require("@google-cloud/compute");
const { getAllServers } = require('../match/matchHandler');
const compute = new Compute();
const _servernameArray = getAllServers();
var timeoutBR;
var timeoutUSE;
var timeoutUSC;


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
    switch(_servername){
        case 'brasil':
            timeoutBR = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
        case 'useast':
            timeoutUSE = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
        case 'uscentral':
            timeoutUSC = setTimeout(function(){ turnOffServer(message, _servername) },4680000)
            break;
    }
    /*lo digo una vez mas, te re complicas fer
    let timerUntilShutdown = {
        brasil: {
            name: 'brasil',
            timeout: 4680000
        },
        useast: {
            name: 'useast',
            timeout: 4680000
        },
        uscentral: {
            name: 'uscentral',
            timeout: 4680000
        }
    };
    

    clearTimeout(timerUntilShutdown[_servername]['timeout']);
    console.log(`Shutdown of the server ${_servername} programmed for 1h 30m`);
    //default 4680000
    //testing with 300000 (5 minutes)
    timerUntilShutdown[_servername]['timeout'] = setTimeout(turnOffServer, 200000, message, _servername);
    */
}

module.exports = { turnOnServer, turnOffServer, turnOnServerWithTimer};