const { PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'kilitliListele',
    description: 'Sunucuda şu an kilitli olan tüm yazı kanallarını listeler.',
    async execute(message, args, client) {
        // Yetki kontrolü: Kanalları Yönet yetkisi yoksa ve config'deki owner değilse engelle
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels) && message.author.id !== config.ownerId) {
            return message.reply('❌ Bu listeyi görmek için yetkin yetersiz kanka.');
        }

        const channels = message.guild.channels.cache;
        
        // Sadece yazı kanallarını filtrele ve içlerinden @everyone rolüne mesaj atması KAPALI (false) olanları bul
        const lockedChannels = channels.filter(channel => {
            if (channel.type !== ChannelType.GuildText) return false;
            
            const overwrite = channel.permissionOverwrites.cache.get(message.guild.roles.everyone.id);
            // SendMessages izni açıkça 'false' yapılmışsa bu kanal kilitlidir
            return overwrite && overwrite.deny.has(PermissionFlagsBits.SendMessages);
        });

        // Embed hazırlığı
        const embed = {
            color: 0x5865F2, // Botinfo'daki tatlı mavi tonun
            title: '🔒 Kilitli Kanallar Listesi',
            footer: {
                text: `PixelCore`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
        };

        // Eğer kilitli kanal yoksa
        if (lockedChannels.size === 0) {
            embed.description = 'Şu anda sunucuda kilitli herhangi bir yazı kanalı bulunmuyor. Her yer açık! 🔓';
        } else {
            // Kilitli kanalları etiketleyerek alt alta diziyoruz
            const channelList = lockedChannels.map(channel => `• <#${channel.id}>`).join('\n');
            embed.description = `Şu anda aşağıda listelenen **${lockedChannels.size}** kanal mesaj gönderimine kapalı:\n\n${channelList}`;
        }

        return message.reply({ embeds: [embed] });
    }
};