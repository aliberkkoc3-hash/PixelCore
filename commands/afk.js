const afkModule = require('../events/afkSystem');

module.exports = {
    name: 'afk',
    description: 'AFK moduna geçer. Kullanım: pixel!afk <sebep>',
    execute(message, args) {
        const reason = args.join(' ') || 'Belirtilmedi';
        afkModule.afkUsers.set(message.author.id, {
            reason: reason,
            timestamp: Date.now()
        });

        message.reply(`✅ Artık AFK'sın. Sebep: \`${reason}\``).then(msg => setTimeout(() => msg.delete(), 5000));
    }
};