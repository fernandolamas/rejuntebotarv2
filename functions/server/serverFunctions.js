const fs = require('fs');
const Compute = require("@google-cloud/compute");
const compute = new Compute();
const CREDENTIALS = 'awscredentials.json';

function turnOnServer(_servername) {

    fs.readFile(CREDENTIALS, (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        JSONKEYS = JSON.parse(content);
        
        //check if this works in another file
        JSONKEYS.servers._servername.vm.start(function (err, operation, apiResponse) {
            console.log(err);
            console.log(apiResponse);
            console.log(operation);
        })
    })
}

function turnOffServer(_servername) {

}

module.exports = { turnOnServer, turnOffServer };