const config = require('../config.json');

module.exports = {
    name: 'help',
    description: 'Mevcut komutları ve kullanımlarını listeler.',
    execute(message, args, client) {
        // Komutları daha düzenli bir string haline getir
        const commandList = client.commands.map(cmd => {
            return `> **${config.prefix}${cmd.name}**\n> ${cmd.description || 'Açıklama bulunmuyor.'}\n`;
        }).join('');

        const embed = {
            color: 0x5865F2,
            title: '🤖 PixelCore Yardım Menüsü',
            description: `Merhaba ${message.author}, işte kullanabileceğin komutlar:\n\n${commandList}`,
            thumbnail: {
                url: client.user.displayAvatarURL({ dynamic: true })
            },
            fields: [
                {
                    name: '💡 İpucu',
                    value: `Komutları kullanırken \`${config.prefix}\` önekini unutma!`,
                    inline: false
                }
            ],
            footer: {
                text: `PixelCore v0.1a • Geliştirici: AliBerk`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] }).catch(() => {});
    }
};