const demoManager = require('../../drive/demoUploader');

function getDemos(message)
{
    demoManager.getDemos(message);
}


module.exports = { getDemos }