module.exports = {
    name: 'rolinfo',
    description: 'Bir rol hakkında detaylı bilgi verir.',
    execute(message, args) {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        
        if (!role) {
            return message.reply('❌ Lütfen bir rol belirtin veya ID girin.');
        }

        const embed = {
            color: role.color || 0x5865F2,
            title: `🛡️ Rol Bilgisi: ${role.name}`,
            fields: [
                { name: '🆔 ID', value: `\`${role.id}\``, inline: true },
                { name: '👥 Üye Sayısı', value: `${role.members.size}`, inline: true },
                { name: '🎨 Renk', value: role.hexColor, inline: true },
                { name: '📅 Oluşturulma', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: false },
                { name: '🔝 Konum', value: `${role.position}. sırada`, inline: true },
                { name: '🤖 Bot Rolü mü?', value: role.tags?.botId ? 'Evet' : 'Hayır', inline: true }
            ],
            footer: { text: 'PixelCore Role System' },
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    }
};