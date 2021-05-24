function convertIDtoString(message,ids)
{
    var users = [];
    var client = message.client
    for (let index = 0; index < ids.length; index++) {
        user = `<@!${ids[index]}>`
        users.push(user)
    }
    return users;
}

module.exports = {convertIDtoString}