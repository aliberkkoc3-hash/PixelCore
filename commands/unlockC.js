const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'unlock',
    description: 'Kilitlenmiş olan kanalı tekrar mesaj gönderimine açar.',
    async execute(message, args, client) {
        // Yetki kontrolü: Kanalları Yönet yetkisi yoksa ve config'deki owner değilse engelle
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels) && message.author.id !== config.ownerId) {
            return message.reply('❌ Bu kanalın kilidini açmak için yetkin yetersiz kanka.');
        }

        try {
            // Kanalın @everyone iznini nötrlüyoruz (böylece varsayılana dönüp açılıyor)
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null
            });

            // Açılış şerefine yeşil tonlarında tatlı bir embed
            const embed = {
                color: 0x57F287, // Yeşil tonu (Açıldığı belli olsun)
                title: '🔓 Kanal Kilidi Açıldı',
                description: `Bu kanal <@${message.author.id}> tarafından tekrar muhabbete açılmıştır. Yazın gelsin!`,
                footer: {
                    text: `PixelCore`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.reply('❌ Kanal kilidini açarken bir hata oluştu. Botun yetkilerini kontrol et kanka.');
        }
    }
};