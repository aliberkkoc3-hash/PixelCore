const config = require('../config.json');

module.exports = {
    name: 'dev',
    description: 'Bir kullanıcının geliştirici profilini gösterir.',
    execute(message, args, client) {
        const targetUser = message.mentions.users.first() || message.author;
        
        // Basit bir örnek: Kullanıcının durumunu (status) ve rozetlerini gösterir.
        // Daha gelişmişi için veritabanı gerekir.
        const embed = {
            color: 0x7289DA,
            title: `💻 ${targetUser.username} - Geliştirici Profili`,
            thumbnail: {
                url: targetUser.displayAvatarURL({ dynamic: true })
            },
            fields: [
                {
                    name: '🌐 Durum',
                    value: targetUser.presence?.status === 'online' ? '🟢 Çevrimiçi' : 
                           targetUser.presence?.status === 'idle' ? '🌙 Boşta' : 
                           targetUser.presence?.status === 'dnd' ? '⛔ Rahatsız Etmeyin' : '⚫ Çevrimdışı',
                    inline: true
                },
                {
                    name: '🏆 Rozetler',
                    value: targetUser.flags.toArray().length > 0 ? targetUser.flags.toArray().join(', ') : 'Yok',
                    inline: true
                },
                {
                    name: '📅 Hesap Tarihi',
                    value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
                    inline: false
                }
            ],
            footer: {
                text: 'PixelCore Developer System',
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};