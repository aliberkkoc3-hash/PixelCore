const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'kanalKilitle',
    description: 'Komutun yazıldığı kanalı mesaj gönderimine kapatır.',
    async execute(message, args, client) {
        // Yetki kontrolü: Kanalları Yönet yetkisi yoksa ve config'deki owner değilse engelle
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels) && message.author.id !== config.ownerId) {
            return message.reply('❌ Bu kanalı kilitlemek için yetkin yetersiz kanka.');
        }

        try {
            // Komutun yazıldığı kanalın @everyone iznini kapatıyoruz
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            // Botinfo komutundaki tarzına uygun tatlı bir embed ile cevap verelim
            const embed = {
                color: 0xED4245, // Kırmızı tonu (Kilitlendiği belli olsun)
                title: '🔒 Kanal Kilitlendi',
                description: `Bu kanal <@${message.author.id}> tarafından muhabbete kapatılmıştır.`,
                footer: {
                    text: `PixelCore`,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.reply('❌ Kanalı kilitlerken bir hata oluştu. Botun rolünün bu kanalın izinlerini değiştirmeye yettiğinden emin ol kanka.');
        }
    }
};