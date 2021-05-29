const fs = require('fs');
const Compute = require("@google-cloud/compute");
const compute = new Compute();


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



function turnOnServer(_servername) {

    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.start(function (err, operation, apiResponse) {
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
    });
}

function turnOffServer(_servername) {

    const vm = SELECTVM[_servername] || DEFAULTVM;
    vm.stop(function (err, operation, apiResponse) {
        console.log(err);
        console.log(apiResponse);
        console.log(operation);
    });
}

module.exports = { turnOnServer, turnOffServer };