let zipper = require('./zipperForDemos')
let driveApi = require('./driveManager');
const path = require('path');

//name of the file to be compiled and uploaded
const filename = 'alldemos.zip'

//name of the demo containin the files to be compiled to a zip 
const demofolder = 'demosfolder'

//mimetype reference https://developer.mozilla.org/es/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const mimetype = 'application/zip'

//path of the file to be uploaded by driveapi
const filePath = path.join(__dirname, filename)

//this is the time for the setTimeout first promise
const timeToFinish = 5000

function getDemos(msg) {

    const myPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(zipper.createDemos(filename, demofolder));
        }, timeToFinish);
    });

    myPromise
        .then(driveApi.uploadDemos(filename, mimetype, filePath, msg))
        .catch(console.log("Demo zipper uploading the demos expected time to finish: ", timeToFinish))

}
console.log("end getting demos");

module.exports = {getDemos}