const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'duyuruOluştur',
    description: 'Yeni bir duyuru oluşturur. (Sadece bot sahibi veya yetkili rol kullanabilir)',
    
    async execute(message, args, client) {
        // Yetki kontrolü: ownerId VEYA announcementControlRole
        const isOwner = message.author.id === config.ownerId;
        const hasRole = message.member.roles.cache.has(config.announcementControlRole);
        
        if (!isOwner && !hasRole) {
            return message.reply({ 
                content: '❌ Bu komutu sadece bot sahibi veya duyuru yetkilisi kullanabilir!',
                ephemeral: true 
            });
        }

        // Mesaj kontrolü
        if (args.length === 0) {
            return message.reply({ 
                content: '❌ Lütfen bir duyuru metni girin!\nKullanım: `!createDuyuru <duyuru_metni>`',
                ephemeral: true 
            });
        }

        const duyuruMetni = args.join(' ');
        const announcementChannelId = config.announcementLogChannel;

        // Kanal kontrolü
        const announcementChannel = client.channels.cache.get(announcementChannelId);
        
        if (!announcementChannel) {
            return message.reply({ 
                content: '❌ Duyuru kanalı bulunamadı! Lütfen config dosyasını kontrol edin.',
                ephemeral: true 
            });
        }

        // Duyuru embed'i oluştur
        const embed = new EmbedBuilder()
            .setTitle('📢 Yeni Duyuru')
            .setDescription(duyuruMetni)
            .setColor('#ff9900')
            .setTimestamp()
            .setFooter({ 
                text: `PixelCore | ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL()
            });

        try {
            // Duyuruyu belirtilen kanala gönder
            await announcementChannel.send({ embeds: [embed] });
            
            // Başarı mesajı
            await message.reply({ 
                content: '✅ Duyuru başarıyla yayınlandı!',
                ephemeral: true 
            });

        } catch (error) {
            console.error('Duyuru gönderme hatası:', error);
            await message.reply({ 
                content: '❌ Duyuru gönderilirken bir hata oluştu!',
                ephemeral: true 
            });
        }
    }
};