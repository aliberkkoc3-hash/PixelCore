const afkUsers = new Map(); // userId -> { reason, timestamp }

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (message.author.bot) return;

        // 1. AFK'dan çıkış kontrolü
        if (afkUsers.has(message.author.id)) {
            afkUsers.delete(message.author.id);
            message.reply('👋 Tekrar hoş geldin! AFK modundan çıktın.').then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // 2. Başkasını etiketleme kontrolü
        const mentions = message.mentions.users;
        if (mentions.size > 0) {
            let afkMessage = '';
            mentions.forEach(user => {
                if (afkUsers.has(user.id)) {
                    const data = afkUsers.get(user.id);
                    const time = `<t:${Math.floor(data.timestamp / 1000)}:R>`;
                    afkMessage += `⚠️ **${user.username}** şu an AFK: \`${data.reason}\` (${time})\n`;
                }
            });

            if (afkMessage) {
                message.reply(afkMessage).then(msg => setTimeout(() => msg.delete(), 10000));
            }
        }
    }
};

// Map'i dışa aktar ki commands/afk.js buraya veri yazabilsin
module.exports.afkUsers = afkUsers;