function convertIDtoString(message,ids)
{
    var users = [];
    var client = message.client
    for (let index = 0; index < ids.length; index++) {
        users.push(ids[index])
    }
    return users;
}

module.exports = {convertIDtoString}