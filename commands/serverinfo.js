module.exports = {
    name: 'sunucu',
    description: 'Sunucu hakkında detaylı bilgi verir.',
    execute(message, args, client) {
        const guild = message.guild;
        
        const embed = {
            color: 0x5865F2,
            title: `📊 ${guild.name} İstatistikleri`,
            thumbnail: {
                url: guild.iconURL({ dynamic: true })
            },
            fields: [
                {
                    name: '👑 Sahip',
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: '🆔 Sunucu ID',
                    value: `\`${guild.id}\``,
                    inline: true
                },
                {
                    name: '📅 Kuruluş',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: '👥 Üyeler',
                    value: `Toplam: **${guild.memberCount}**\nİnsan: **${guild.members.cache.filter(m => !m.user.bot).size}**\nBot: **${guild.members.cache.filter(m => m.user.bot).size}**`,
                    inline: false
                },
                {
                    name: '📂 Kanallar',
                    value: `Metin: **${guild.channels.cache.filter(c => c.type === 0).size}**\nSes: **${guild.channels.cache.filter(c => c.type === 2).size}**`,
                    inline: false
                }
            ],
            footer: {
                text: `PixelCore • ${client.user.username}`,
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};