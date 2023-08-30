
const showLadderEmbed = (playerList, channelId, discordClient, embedBuilder, title, footer) => {
    const ladderEmbed = embedBuilder
        .setColor('#fca903')
        .setTitle(title)
        .setDescription(playerList)
        .setFooter({ text: footer });

        setTimeout(() => {
            sendDiscordMessage(ladderEmbed, channelId, discordClient).catch(err => console.error(err));
    },3000)
    
}

const sendDiscordMessage = async (ladderEmbed, channelId, discordClient) => {
    try {        
        let rankingChat = discordClient.channels.cache.get(channelId)
        await rankingChat.messages.fetch({limit: 100}).then( async (fetched) => {
            await rankingChat.bulkDelete(fetched).catch(console.error);
        }).catch(console.error)
        .finally(() => {
            rankingChat.send({
                embeds: [ladderEmbed]
            }).catch(console.error)
        })
    }
    catch (err) {
        console.error(`Unable to retrieve ranking channel ${err}`)
    }
}

module.exports = { showLadderEmbed }