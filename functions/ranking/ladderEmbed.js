
const showLadderEmbed = (playerList, channelId, discordClient, embedBuilder, title, footer) => {
    const ladderEmbed = embedBuilder
        .setColor('#fca903')
        .setTitle(title)
        .setDescription(playerList)
        .setFooter({ text: footer });

    //TODO: check if message exists before sending/editing
    setTimeout(() => {
        sendDiscordMessage(ladderMessage, ladderEmbed, channelId, discordClient);
    },3000)
}

const sendDiscordMessage = async (ladderMessage, ladderEmbed, channelId, discordClient) => {
    try {        
        rankingChat = discordClient.channels.cache.get(channelId)
        await rankingChat.messages.fetch({limit: 100}).then( async (fetched) => {
            await rankingChat.bulkDelete(fetched).catch(console.error);
        }).catch(console.error)
        .finally(() => {
            rankingChat.send({
                embeds: [ladderEmbed]
            }).then(msg => ladderMessage = msg).catch(console.error)
        })
    }
    catch (err) {
        console.error(`Unable to retrieve ranking channel ${err}`)
    }
}

module.exports = { showLadderEmbed }