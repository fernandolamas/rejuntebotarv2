const fetch = require('node-fetch')

function convertIDtoString(message,ids)
{
    var users = [];
    var client = message.client
    for (let index = 0; index < ids.length; index++) {
        var user = `<@!${ids[index]}>`
        users.push(user)
    }
    return users;
}

module.exports = {convertIDtoString}