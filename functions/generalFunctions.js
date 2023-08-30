const fetch = require('node-fetch')
const { retrieveRatingByDiscordIds } = require('../functions/ranking/searcher.js');

function convertIDtoString(message,ids)
{
    var users = [];
    for (let index = 0; index < ids.length; index++) {
        var user = `<@!${ids[index]}>`
        users.push(user)
    }
    return users.join(', ');
}

function getUserFromMention(mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return mention;
	}
}

function voteFor(message,args)
{
	argsSplited = args.join(' ')
	message.channel.send(`${argsSplited}`)
	.then(m => {
		m.react("👍")
		m.react("👎")
	})
}

async function convertIDtoUserWithEmojiElo(client, ids) {

    let avgTeamRating = 0;
    var rankings = JSON.parse(JSON.stringify(await retrieveRatingByDiscordIds(ids)));
    const users = makeUserListWithEmoji(client,ids);

    for(let u in users) {
        avgTeamRating += parseInt(rankings[u].rating);
        users[u] = `:military_medal:\`${rankings[u].rating}\` ` + users[u];
    }
    const totalRating = Math.floor(avgTeamRating);
    avgTeamRating = Math.floor(avgTeamRating / ids.length);
    return {users: users.join(', '), rating: avgTeamRating, totalRating};
}

function convertIDtoUserWithEmoji(client, ids) {
    const users = makeUserListWithEmoji(client,ids);
    return users.join(', ');
}

function makeUserListWithEmoji(client, ids) {
    var users = [];
    for (let index = 0; index < ids.length; index++) {
        const userId = ids[index];
        const member = client.guild.members.cache.get(userId);

        //To-Do
        const specificRole1 = client.guild.roles.cache.get('1133445840254554132'); // Contributors
        const specificRole2 = client.guild.roles.cache.get('737088122017284107'); // adm
		const specificRole3 = client.guild.roles.cache.get('724878162466570251'); // Server Booster

        const emojiForRole1 = '🚀'; // Contributors
        const emojiForRole2 = '🤖'; // ADM
		const emojiForRole3 = '⚡'; // Server Booster

        let emoji = '';
        if (specificRole1 && member && member.roles.cache.has(specificRole1.id)) {
            emoji = emojiForRole1;
        } else if (specificRole2 && member && member.roles.cache.has(specificRole2.id)) {
            emoji = emojiForRole2;
        } else if (specificRole3 && member && member.roles.cache.has(specificRole3.id)) {
            emoji = emojiForRole3;
        }

        const user = member ? `<@!${userId}>` : `<@${userId}>`;
        users.push(user + ' ' + emoji);
    }
    return users;
}

module.exports = {convertIDtoString, getUserFromMention, voteFor, convertIDtoUserWithEmoji, convertIDtoUserWithEmojiElo}